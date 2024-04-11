import boto3
from datetime import datetime

dynamodb = boto3.client('dynamodb')
table = 'Products' 

def lambda_handler(event, context):
    print("Evento recibido:", event)
    

            
    if event['httpMethod'] == 'GET':
        
        if event['path'] == '/get_products':
            response = get_products()
            return response
            
        elif event['path'] == '/detail_product':
            response = get_product_data(str(event['sku']))
            return response
            
        else:
            return {
                'status': 404,
                'message': 'No se encuentra el recurso solicitado'
            }
    
    elif event['httpMethod'] == 'POST' and event['path'] == '/add_product':
        
        response = add_product(event)
        return response
            
    elif event['httpMethod'] == 'PUT' and event['path'] == '/edit_product':
        
        response = valid_SKU(event)
        return response
        
    elif event['httpMethod'] == 'DELETE' and event['path'] == '/delete_product':
        
        response = delete_product(event)
        return response

    else:
        return {
            'status': 404,
            'message': 'No se encuentra el recurso solicitado'
        }
        


def get_products():
    
    try:
        response = dynamodb.scan(
        TableName='Products',
        )
        
        items = response['Items']
        sorted_items = sorted(items, key=lambda x: x['Creation_Date']['S'], reverse=True)


        items = response['Items']
        return {
            'statusCode': 200,
            'Products': sorted_items
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'message': str(e)
        }



def add_product(event):

    currentDate = datetime.now()
    sku = int(currentDate.strftime('%Y%m%d%H%M%S'))
    creation_date = currentDate.strftime('%d/%m/%Y-%H:%M:%S')
    
    try:
        
        product_data = {
            'SKU': {'N': str(sku)},
            'Name': {'S': str(event['name'])},
            'Description': {'S': str(event['description'])},
            'Category':{'S': str(event['category'])},
            'Price': {'N': str(event['price'])},
            'Creation_Date': {'S': str(creation_date)}
        }
        
        dynamodb.put_item(TableName = table, Item = product_data)
        
        return {
            'statusCode': 200,
            'message': 'Producto agregado.'
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'message': 'Producto no agregado.'
        }



def valid_SKU(event):
    
    response = dynamodb.get_item(
            TableName=table,
            Key={
                'SKU': {'N': str(event['sku'])},
                'Creation_Date': {'S': event['creation_date']}
            })
    
    if 'Item' in response:
        response = edit_product(event)
        return response
    else:
        return {
        'statusCode': 500,
        'message': 'No existe el producto.'
        }



def edit_product(event):

    try:
        update_expression = "SET #N = :n, Description = :d, Category = :c, Price = :p"
        
        expression_attribute_values = {
            ':n': {'S': str(event['name'])},
            ':d': {'S': str(event['description'])},
            ':c': {'S': str(event['category'])},
            ':p': {'N': str(event['price'])}
        }
        
        dynamodb.update_item(
            TableName=table,
            Key={'SKU': {
                'N': str(event['sku'])},
                'Creation_Date': {'S': event['creation_date']}},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames={'#N': 'Name'}
        )
        
        return {
            'statusCode': 200,
            'message': 'Producto editado.'
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'message': 'Producto no editado.'
        }


def delete_product(event):
    
    try:
        
        dynamodb.delete_item(
            TableName=table,
            Key={
                'SKU': {'N': str(event['sku'])} ,
                'Creation_Date': {'S': event['creation_date']}
            }
        )
        
        return {
            'statusCode': 200,
            'message': 'Producto eliminado.'
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'message': 'Producto no eliminado.'
        }
        
        
def get_product_data(sku):
    
    try:
    
        response = dynamodb.query(
            TableName=table,
            KeyConditionExpression='SKU = :val',
            ExpressionAttributeValues={
                ':val': {'N': sku} 
            }
        )
        
        return {
            'statusCode': 200,
            'Product': response['Items'][0]
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'message': str(e)
        }