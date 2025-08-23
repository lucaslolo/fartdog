export async function handler(event, context) {
  console.log('Scheduled function triggered at:', new Date().toISOString());

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Scheduled function executed successfully!' }),
  };
}
