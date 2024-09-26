from azure.storage.blob import BlobServiceClient
from io import BytesIO
import pandas as pd
import re
import json
from langchain_core.prompts import ChatPromptTemplate
from llm_config import llm
from ai_feature import get_column_dependencies_using_llm, get_table_description

# Azure Storage account name
account_name = 'hackathonstoragewe'
container_name = 'files'
#blob_name = 'Sales DS/Historical-Active-Sales.csv'  # The CSV file in the container
# SAS token (without the leading `?`)
sas_token = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupyx&se=2024-09-21T21:32:46Z&st=2024-09-19T13:32:46Z&spr=https&sig=kOuK1V%2F4WLrU6uttQF67dNxJotYdFStX9y8Q%2FTTA7v4%3D"
input_tbls_list = [
    "Movie-Data",
    "Historical-Active-Sales",
    "Webpages-Classification-Large",
    "Webpages-Classification",
]

input_tbls_list = []


def get_sa_csv_erd(account_name, container_name, sas_token, input_tbls_list):


    # Construct the full URL to the Blob service
    blob_service_url = f"https://{account_name}.blob.core.windows.net?{sas_token}"

    # Create a BlobServiceClient using the SAS token
    blob_service_client = BlobServiceClient(account_url=blob_service_url)

    # Function to list .csv files in a specific container using BlobServiceClient
    def list_csv_files(blob_service_client, container_name):
        csv_files = []
        
        # Get container client (if you don't want to use ContainerClient directly)
        container_client = blob_service_client.get_container_client(container_name)
        
        # List blobs in the container
        blob_list = container_client.list_blobs()
        
        # Filter for blobs ending with '.csv'
        for blob in blob_list:
            if blob.name.endswith('.csv'):
                csv_files.append(blob.name)
        
        return csv_files

    # Call the function and list all CSVs in the specified container
    csv_files = list_csv_files(blob_service_client, container_name)

    # Example: List containers in the storage account
    containers = blob_service_client.list_containers()

    # Get a container client
    container_client = blob_service_client.get_container_client(container_name)

    # Function to get CSV columns from blob in Azure Storage
    def get_csv_columns_from_blob(blob_client):
        # Download the first few bytes of the blob (just enough for the header)
        stream = blob_client.download_blob(offset=0, length=2048*4)

        # Load the entire content into memory as bytes (since we need at least the header)
        content = stream.readall()

        # Use BytesIO to wrap the bytes content for pandas
        csvfile = BytesIO(content)
        
        # Use pandas to load only the first row (header) by setting nrows=0
        df = pd.read_csv(csvfile, nrows=3)
        
        # Return the column names
        return df.columns.tolist()

    str_ai_input = "['TABLE_NAME', 'COLUMN_NAME']\n"
    unsuccessful_reads = "Unsuccessful file reads:\n"

    tables = []
    table_cols = []

    for blob_name in csv_files:
        # Use regex to match the filename before '.csv'
        match = re.search(r'/([^/]+)\.csv$', blob_name)
        if match:
            tbl_name = match.group(1)
            if len(input_tbls_list) == 0:
                file_input_list_empty = True

            if (tbl_name in input_tbls_list) or file_input_list_empty:
                # Download the blob (CSV file)
                try:
                    blob_client = container_client.get_blob_client(blob_name)
                    columns = get_csv_columns_from_blob(blob_client)
                    for col in columns:
                        if not col.startswith("Unnamed"): 
                            str_ai_input += f"('{tbl_name}','{col}')\n"
                            table_cols += [
                                {
                                    "tableName": tbl_name,
                                    "columnName": col,
                                    "dataType": "str"
                                }
                            ]
                    tables += [
                        {
                            "tableName": tbl_name,
                            "tableComments": "",
                            "x": 0,
                            "y": 0,
                        }
                    ]
                except:
                    unsuccessful_reads += f"{tbl_name}\n"
            else:
                unsuccessful_reads += f"{tbl_name}\n"

    col_relations = get_column_dependencies_using_llm(llm, str_ai_input)
    erd_input = {
        "tables": tables,
        "tableCols": table_cols,
        "columnRelations": col_relations,
    }
    return json.dumps(json.dumps(erd_input))#, unsuccessful_reads

def get_sa_csv_descriptions(account_name, container_name, sas_token, file_name):


    # Construct the full URL to the Blob service
    blob_service_url = f"https://{account_name}.blob.core.windows.net?{sas_token}"

    # Create a BlobServiceClient using the SAS token
    blob_service_client = BlobServiceClient(account_url=blob_service_url)

    # Function to list .csv files in a specific container using BlobServiceClient
    def list_csv_files(blob_service_client, container_name):
        csv_files = []
        
        # Get container client (if you don't want to use ContainerClient directly)
        container_client = blob_service_client.get_container_client(container_name)
        
        # List blobs in the container
        blob_list = container_client.list_blobs()
        
        # Filter for blobs ending with '.csv'
        for blob in blob_list:
            if blob.name.endswith('.csv'):
                csv_files.append(blob.name)
        
        return csv_files

    # Call the function and list all CSVs in the specified container
    csv_files = list_csv_files(blob_service_client, container_name)

    # Example: List containers in the storage account
    containers = blob_service_client.list_containers()

    # Get a container client
    container_client = blob_service_client.get_container_client(container_name)

    # Function to get CSV columns from blob in Azure Storage
    def get_csv_columns_from_blob(blob_client):
        # Download the first few bytes of the blob (just enough for the header)
        stream = blob_client.download_blob(offset=0, length=2048*4)

        # Load the entire content into memory as bytes (since we need at least the header)
        content = stream.readall()

        # Use BytesIO to wrap the bytes content for pandas
        csvfile = BytesIO(content)
        
        # Use pandas to load only the first row (header) by setting nrows=0
        df = pd.read_csv(csvfile, nrows=3)
        
        # Return the column names
        return df.columns.tolist(), df

    # Function to convert DataFrame columns to a dictionary with formatted strings
    def df_to_dict_of_strings(df):
        result = {}
        for col in df.columns:
            if not col.startswith("Unnamed"):
                # Join column values as a string with ", " separator
                values_str = ", ".join(map(str, df[col].tolist()))
                result[col] = values_str  # Assign the string to the corresponding column name
        
        return result
    
    str_ai_input = "['TABLE_NAME', 'COLUMN_NAME', 'SAMPLE_DATA']\n"
    unsuccessful_reads = "Unsuccessful file reads:\n"

    for blob_name in csv_files:
        # Use regex to match the filename before '.csv'
        match = re.search(r'/([^/]+)\.csv$', blob_name)
        if match:
            tbl_name = match.group(1)

            if tbl_name == file_name:
                # Download the blob (CSV file)
                try:
                    blob_client = container_client.get_blob_client(blob_name)
                    columns, df = get_csv_columns_from_blob(blob_client)

                    for col in columns:
                        if not col.startswith("Unnamed"): 
                            sample_data = df_to_dict_of_strings(df)
                            str_ai_input += f"('{tbl_name}','{col}', {sample_data})\n"
                except:
                    unsuccessful_reads += f"{tbl_name}\n"
            else:
                unsuccessful_reads += f"{tbl_name}\n"

    return get_table_description(llm, str_ai_input)


# erd_input = get_sa_csv_erd(account_name, container_name, sas_token, input_tbls_list)
file_desc = get_sa_csv_descriptions(account_name, container_name, sas_token, "Webpages-Classification-Large")

# print(unsuccessful_reads)
# print(erd_input)
print(file_desc)

# TABLE_NAME, COLUMN_NAME, SAMPLE_DATA
# tbl1, col1, [val1, val2, val3]