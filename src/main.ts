import { GraphqlApi, Schema, AuthorizationType } from '@aws-cdk/aws-appsync';
import { Table, BillingMode, AttributeType } from '@aws-cdk/aws-dynamodb';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { App, Construct, Stack, StackProps, Expiration, Duration, CfnOutput } from '@aws-cdk/core';

export class NotesBackendStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // Create an AppSync GraphQL API
    const api = new GraphqlApi(this, 'NotesAPI', {
      name: 'NotesAPI',
      schema: Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365)),
          },
        },
      },
      xrayEnabled: true,
    });

    // Print API endpoint URL
    new CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });

    // Print API key
    new CfnOutput(this, 'GraphQLAPIKey', {
      value: api.apiKey || '',
    });

    // Create Lambda function to interact with DynamoDB
    const notesLambda = new NodejsFunction(this, 'NotesFunction', {
      runtime: Runtime.NODEJS_12_X,
      memorySize: 1024,
      handler: 'handler',
      entry: 'lambda/main.ts',
      bundling: {
        externalModules: [
          'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
    });

    // Set Lambda function as a data source for the AppSync API
    const dataSource = api.addLambdaDataSource('lambdaDatasource', notesLambda);

    // Attach GraphQL resolvers
    dataSource.createResolver({
      typeName: 'Query',
      fieldName: 'getNoteById',
    });

    dataSource.createResolver({
      typeName: 'Query',
      fieldName: 'listNotes',
    });

    dataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createNote',
    });

    dataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteNote',
    });

    dataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateNote',
    });

    // Create DynamoDB table
    const notesTable = new Table(this, 'NotesTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
    });

    // Allow the Lambda function to read and write DynamoDB table
    notesTable.grantReadWriteData(notesLambda);

    // Add DynamoDB table reference as an environment variablw to Lambda function
    notesLambda.addEnvironment('NOTES_TABLE', notesTable.tableName);
  }
}

// for dev env., use account/region from CDK CLI
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new NotesBackendStack(app, 'NotesBackendDev', { env: devEnv });
// new NotesBackendStack(app, 'NotesBackendProd', { env: prodEnv });

app.synth();
