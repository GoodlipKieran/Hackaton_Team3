import azure.functions as func
import logging
import pyodbc
import re
import json
from sa_link import get_sa_csv_erd

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

openai_api_key = "30d9470f48874382834b4f69bf974b10"
openai_deployment_name = "hackathon24"
openai_url_endpoint = "https://hackathon24-team3-openai.openai.azure.com/"
account_name = 'eunsthackathon03'
container_name = 'sample-csv-data'
sas_token = "sp=ro&st=2024-09-20T13:06:48Z&se=2024-09-20T21:06:48Z&spr=https&sv=2022-11-02&sr=c&sig=Qx9ybmYO%2FudWcKCwQbkNBcNFhzKGhyNqQxZ2COBcnHM%3D"


@app.route(route="get_sa_erd")
def get_sa_erd(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()

        try:
            account_name = req_body['storageAccountName']
            container_name = req_body['containerName']
            sas_token = req_body['sasToken']
            input_tbls_list = req_body['tableNames']
        except Exception as ex:
            logging.error(f"Mandatory Credentials Missing. {ex}")
            raise ValueError(f"Exception occurred: {ex}")
        result = get_sa_csv_erd(account_name, container_name, sas_token, input_tbls_list)

        # Return a success response
        return func.HttpResponse(result, status_code=200)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=69420)

@app.route(route="get_sa_csv_descriptions")
def get_sa_csv_descriptions(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
 
        try:
            tbl_name = req_body['tableName']
        except Exception as ex:
            logging.error(f"Mandatory Credentials Missing. {ex}")
            raise ValueError(f"Exception occurred: {ex}")
        result = get_sa_csv_descriptions(account_name, container_name, sas_token, tbl_name)
 
        # Return a success response
        return func.HttpResponse(result, status_code=200)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=69420)

@app.route(route="get_sql_metadata")
def get_sql_metadata(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()

        try:
            server_connection_string = req_body['ServerConnectionString']
            server_port = req_body['ServerPort']
            db_name = req_body['DBName']
            login = req_body['Login']
            password = req_body['Password']
            logging.warning(f'Server: {server_connection_string},{server_port}\n Database:{db_name} \n Database Login: {login}')
        except Exception as ex:
            logging.error(f"Mandatory Credentials Missing. {ex}")
            raise ValueError(f"Exception occurred: {ex}")
        
        table_names = []
        try:
            table_names = req_body['TableNames']
        except Exception as ex:
            logging.warning('Jerome pls. Table Names not Set.')
        
        # Set the DB Connection String
        connection_string = (
            'DRIVER={ODBC Driver 18 for SQL Server};'
            f'SERVER=tcp:{server_connection_string},{server_port};'
            f'DATABASE={db_name};'
            f'UID={login};'
            f'PWD={{{password}}};'
            'Encrypt=yes;'
            'TrustServerCertificate=no;'
            'Connection Timeout=30;'
        )

        logging.warning('Fetching table metadata.')
        table_metadata, relationships = fetch_table_metadata(connection_string, table_names)
        logging.warning('Table Metadata and relationships obtained.')

        result = create_erd_json(table_metadata, relationships)
        logging.warning('ERD Created.')

        # Return a success response
        return func.HttpResponse(result, status_code=200)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=69420)

@app.route(route="get_sql_metadata_ai")
def get_sql_metadata_ai(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    logging.warning('Hello')
    req_body = req.get_json()

    try:
        server_connection_string = req_body['ServerConnectionString']
        server_port = req_body['ServerPort']
        db_name = req_body['DBName']
        login = req_body['Login']
        password = req_body['Password']
        table_name = req_body["TableName"]
    except Exception as ex:
        logging.error(f"Mandatory Credentials Missing. {ex}")
        raise ValueError(f"Exception occurred: {ex}")
        
    # Set the DB Connection String
    connection_string = (
        'DRIVER={ODBC Driver 18 for SQL Server};'
        f'SERVER=tcp:{server_connection_string},{server_port};'
        f'DATABASE={db_name};'
        f'UID={login};'
        f'PWD={{{password}}};'
        'Encrypt=yes;'
        'TrustServerCertificate=no;'
        'Connection Timeout=30;'
    )

    result = get_table_columns_and_dtypes(connection_string, table_name)

    # Return a success response
    return func.HttpResponse(result, status_code=200)

def fetch_table_metadata(connection_string, table_names):
    metadata = {}
    logging.warn('true' if table_names else 'false')

    try:
        # Connect to SQL Server
        with pyodbc.connect(connection_string) as conn:
            cursor = conn.cursor()

            if table_names:
                for schema_table in table_names:
                    table = re.search(r'\.\[([^\]]+)\]', schema_table).group(1)
                    # Query to retrieve table columns, primary keys, and foreign keys
                    query_columns = f"""
                    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = '{table}'
                    """
                    cursor.execute(query_columns)
                    columns = cursor.fetchall()

                    query_primary_key = f"""
                    SELECT COLUMN_NAME
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
                    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k ON tc.CONSTRAINT_NAME = k.CONSTRAINT_NAME AND tc.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND tc.CONSTRAINT_CATALOG = k.CONSTRAINT_CATALOG
                    WHERE tc.TABLE_NAME = '{table}' AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                    """
                    cursor.execute(query_primary_key)
                    primary_keys = cursor.fetchall()

                    query_foreign_keys = f"""
                    SELECT COLUMN_NAME
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
                    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k ON tc.CONSTRAINT_NAME = k.CONSTRAINT_NAME AND tc.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND tc.CONSTRAINT_CATALOG = k.CONSTRAINT_CATALOG
                    WHERE tc.TABLE_NAME = '{table}' AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
                    """
                    cursor.execute(query_foreign_keys)
                    foreign_keys = cursor.fetchall()

                    metadata[table] = {
                        'schema_table': schema_table.replace("[", "").replace("]", ""),
                        'columns': columns,
                        'primary_keys': primary_keys,
                        'foreign_keys': foreign_keys
                    }

                    # logging.info(metadata[table])
            else:
                query_columns = f"""
                SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                """
                cursor.execute(query_columns)
                columns = cursor.fetchall()

                query_primary_key = f"""
                SELECT tc.TABLE_NAME, COLUMN_NAME
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
                INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k ON tc.CONSTRAINT_NAME = k.CONSTRAINT_NAME AND tc.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND tc.CONSTRAINT_CATALOG = k.CONSTRAINT_CATALOG
                WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                """
                cursor.execute(query_primary_key)
                primary_keys = cursor.fetchall()

                query_foreign_keys = f"""
                SELECT tc.TABLE_NAME, COLUMN_NAME
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
                INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k ON tc.CONSTRAINT_NAME = k.CONSTRAINT_NAME AND tc.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND tc.CONSTRAINT_CATALOG = k.CONSTRAINT_CATALOG
                WHERE tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
                """
                cursor.execute(query_foreign_keys)
                foreign_keys = cursor.fetchall()

                table_schema_mapping = f"""
                SELECT DISTINCT TABLE_NAME, CONCAT(TABLE_SCHEMA,'.',TABLE_NAME) AS SCHEMA_TABLE
                FROM INFORMATION_SCHEMA.COLUMNS 
                """
                cursor.execute(table_schema_mapping)
                table_schema_keys = cursor.fetchall()

                # Process columns
                for table_name in table_schema_keys:
                    if table_name[0] not in metadata:
                        metadata[table_name[0]] = {
                            'columns': [],
                            'primary_keys': [],
                            'foreign_keys': [],
                            'schema_table': None
                        }

                        for row in columns:
                            if row[0] == table_name[0]:
                                metadata[table_name[0]]['columns'].append(row[1:])

                        for row in primary_keys:
                            if row[0] == table_name[0]:
                                metadata[table_name[0]]['primary_keys'].append(row[1:])

                        for row in foreign_keys:
                            if foreign_keys[0] == table_name[0]:
                                metadata[table_name[0]]['foreign_keys'].append(row[1:])

                        for row in table_schema_keys:
                            if row[0] == table_name[0]:
                                metadata[table_name[0]]['schema_table'] = row[1]

                logging.info(metadata)

            query_relationships = f"""
            WITH KeyConstraints AS (
                SELECT 
                    i.object_id, 
                    i.is_unique, 
                    ic.column_id
                FROM 
                    sys.indexes AS i
                INNER JOIN 
                    sys.index_columns AS ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
                WHERE 
                    i.is_unique = 1 -- Considering only unique indexes (PKs or unique constraints)
            )
            SELECT
                fk.name AS FK_Name,
                CONCAT(fk_s.name, '.', tp.name)  AS FK_Table,
                cp.name AS FK_Column,
                CONCAT(pk_s.name, '.', ref.name) AS PK_Table,
                rc.name AS PK_Column,
                CASE 
                    -- One-to-One: Foreign key column is unique on the left (FK table) and primary key is unique on the right (PK table)
                    WHEN fkc_constraint.is_unique = 1 AND ref_constraint.is_unique = 1 THEN 'ONE_TO_ONE'
                    -- Many-to-One: Foreign key column is not unique, but the primary key is unique on the right (PK table)
                    WHEN fkc_constraint.is_unique = 0 AND ref_constraint.is_unique = 1 THEN 'MANY_TO_ONE'
                    ELSE 'MANY_TO_MANY'
                END AS Cardinality
            FROM
                sys.foreign_keys AS fk
            INNER JOIN
                sys.tables AS tp ON fk.parent_object_id = tp.object_id
            LEFT OUTER JOIN 
                sys.schemas AS fk_s ON tp.schema_id = fk_s.schema_id
            INNER JOIN
                sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
            INNER JOIN
                sys.columns AS cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
            INNER JOIN
                sys.tables AS ref ON fk.referenced_object_id = ref.object_id
            LEFT OUTER JOIN 
                sys.schemas AS pk_s ON ref.schema_id = pk_s.schema_id
            INNER JOIN
                sys.columns AS rc ON fkc.referenced_object_id = rc.object_id AND fkc.referenced_column_id = rc.column_id
            -- Join with the KeyConstraints CTE for both FK and PK tables
            LEFT JOIN 
                KeyConstraints AS fkc_constraint ON fkc.parent_object_id = fkc_constraint.object_id AND fkc.parent_column_id = fkc_constraint.column_id
            LEFT JOIN 
                KeyConstraints AS ref_constraint ON fkc.referenced_object_id = ref_constraint.object_id AND fkc.referenced_column_id = ref_constraint.column_id
            ORDER BY
                FK_Table, FK_Column;
            """
            try:
                cursor.execute(query_relationships)
                relationships = cursor.fetchall()
            except Exception as e:
                logging.info(relationships)

        return metadata, relationships
    except Exception as ex:
        raise Exception(f"Exception: {ex}")

def create_erd_json(table_metadata, relationships):
    nodes = []
    table_cols = []
    try:
        for table, details in table_metadata.items():
            node = {
                "tableName": details['schema_table'],
                "tableComments": f"",
                "x": details.get('x', 0),
                "y": details.get('y', 0)  
            }
            nodes.append(node)

            # Create table columns list
            for column in details['columns']:
                table_col = {
                    "tableName": details['schema_table'],
                    "columnName": column[0],
                    "dataType": column[1]
                }
                table_cols.append(table_col)

        # Create edges for foreign key relationships
        edges = []
        for _, fk_table, fk_column, pk_table, pk_column, cardinality in relationships:
            edge = {
                "sourceTableName": fk_table,
                "sourceColumnName": fk_column,
                "targetTableName": pk_table,
                "targetColumnName": pk_column,
                "type": cardinality 
            }
            edges.append(edge)

        # Construct the JSON object
        erd_json = {
            "tables": nodes,
            "tableCols": table_cols,
            "columnRelations": edges
        }

        # Convert to JSON string
        json_output = json.dumps(json.dumps(erd_json))
                
        return json_output
    except Exception as ex:
        raise Exception(f"Exception: {ex}")

def get_table_columns_and_dtypes(connection_string, table_name):
    try:
        with pyodbc.connect(connection_string) as conn:
            cursor = conn.cursor()

            fetch_query = f"""
                SELECT 
                    t.name AS TABLE_NAME,
                    c.name AS COLUMN_NAME
                FROM 
                    sys.tables t
                INNER JOIN 
                    sys.columns c ON t.object_id = c.object_id
                INNER JOIN 
                    sys.types ty ON c.user_type_id = ty.user_type_id
                WHERE t.name = '{table_name}'
                ORDER BY 
                    t.name, c.column_id;
            """
            cursor.execute(fetch_query)

            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            row_dict = {}
            for row in rows:
                row_dict[row[0]] = row[1]
            
            # Format the output
            output = ["['TABLE_NAME', 'COLUMN_NAME']"]
            output += [f"('{table}', '{column}')" for table, column in row_dict.items()]

            # Print result
            formatted_output = "\n".join(output)
            return(formatted_output)
    except Exception as ex:
        raise Exception(f"Exception: {ex}")
