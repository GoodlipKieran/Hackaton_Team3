import json
from langchain_core.prompts import ChatPromptTemplate
# input llm and string table_schemas
def get_column_dependencies_using_llm(llm, table_schemas):
    table_schemas_prompt = """
    Given all table schemas of a database, your task is to identify the dependencies:
    - "dependencies": Links and dependencies between columns from different tables. Mostly match columns with the same or similar names from different tables. This includes any explicit relationships or links between tables, such as foreign key relationships.

    Respond with a valid JSON String. See the below example.

    Table Schemas:
    ['TABLE_NAME', 'COLUMN_NAME']
    ('Product', 'ProductID')
    ('Product', 'ProductName')
    ('Product', 'Price')
    ('Customer', 'CustomerID')
    ('Customer', 'CustomerName')
    ('Customer', 'Email')
    ('Customer', 'PhoneNumber')
    ('Order', 'OrderID')
    ('Order', 'CustomerID')
    ('Order', 'ProductID')
    ('Order', 'OrderDate')
    ('Order', 'Quantity')
    ('Order', 'TotalAmount')
    ('Payment', 'PaymentID')
    ('Payment', 'OrderID')
    ('Payment', 'PaymentDate')
    ('Payment', 'Amount')
    ('Shipment', 'ShipmentID')
    ('Shipment', 'ProductID')
    ('Shipment', 'OrderID')
    ('Shipment', 'ShipmentDate')
    ('Shipment', 'Carrier')
    Response:{{
    "dependencies": {{
        {{"sourceTableName":"Order","sourceColumnName":"CustomerID","targetTableName":"Customer","targetColumnName":"CustomerID"}},
        {{"sourceTableName":"Order","sourceColumnName":"ProductID","targetTableName":"Product","targetColumnName":"ProductID"}},
        {{"sourceTableName":"Payment","sourceColumnName":"OrderID","targetTableName":"Order","targetColumnName":"OrderID"}},
        {{"sourceTableName":"Shipment","sourceColumnName":"OrderID","targetTableName":"Order","targetColumnName":"OrderID"}}
    }}}}
            
    Table Schemas:
    ['TABLE_NAME', 'COLUMN_NAME']
    ('Employee', 'EmployeeID')
    ('Employee', 'FirstName')
    ('Employee', 'LastName')
    ('Employee', 'Email')
    ('Department', 'DepartmentID')
    ('Department', 'DepartmentName')
    ('EmployeeDepartment', 'EmployeeID')
    ('EmployeeDepartment', 'DepartmentID')
    ('EmployeeDepartment', 'StartDate')
    Response:{{
    "dependencies": {{
        {{"sourceTableName":"EmployeeDepartment","sourceColumnName":"EmployeeID","targetTableName":"Employee","targetColumnName":"EmployeeID"}},
        {{"sourceTableName":"EmployeeDepartment","sourceColumnName":"DepartmentID","targetTableName":"Department","targetColumnName":"DepartmentID"}},
    }}}}
    """
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "{table_schemas_prompt}",
            ),
            ("human", "Table Schemas: {schema_of_tables} Response:"),
        ]
    )

    chain = prompt | llm

    response_dependencies_description = chain.invoke(
        {
            "table_schemas_prompt": table_schemas_prompt,
            "schema_of_tables": table_schemas
        }
    )
    print('cost in usd',response_dependencies_description.usage_metadata["input_tokens"]*0.005/1000+response_dependencies_description.usage_metadata["output_tokens"]*0.015/1000)
    response_dependencies_description = response_dependencies_description.content
    print(response_dependencies_description)
    # response
    start_index = response_dependencies_description.find('{')
    end_index = response_dependencies_description.rfind('}') + 1
    extracted_json_string = response_dependencies_description[start_index:end_index]
    dependencies_json = json.loads(extracted_json_string)['dependencies']
    # Adding "type": "ONE_TO_ONE" to each dictionary
    for record in dependencies_json:
        record["type"] = "ONE_TO_ONE"
    return dependencies_json

def get_table_description(llm, schema_of_table_with_samples):
    table_description_prompt = """
    Provide me with a table description include only: 
    - Brief description
    - PII: Identify all Personally identifiable information identification. This includes sensitive data types such as email addresses, home addresses, passwords, phone numbers, credit card numbers and others.
    - Data Granularity
    - Performance Considerations for calculating KPIs
    - Include an assessment of potential performance bottlenecks or areas that may require optimization.
    """

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "{table_description_prompt}",
            ),
            ("human", "Table Schema: {schema_of_table_with_samples}. Reply with only user friendly plain text"),
        ]
    )

    chain = prompt | llm

    response_table_description = chain.invoke(
        {
            "table_description_prompt": table_description_prompt,
            "schema_of_table_with_samples": schema_of_table_with_samples
        }
    )
    print('cost in usd',response_table_description.usage_metadata["input_tokens"]*0.005/1000+response_table_description.usage_metadata["output_tokens"]*0.015/1000)
    return response_table_description.content

