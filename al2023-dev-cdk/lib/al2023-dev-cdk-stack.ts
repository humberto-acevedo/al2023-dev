import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export class Al2023DevCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create KMS key for ECR encryption
    const ecrKmsKey = new kms.Key(this, 'ECRKMSKey', {
      description: 'KMS key for ECR repository encryption',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN for production
    });

    // Create ECR Repository with enhanced security
    const repository = new ecr.Repository(this, 'MyECRRepository', {
      repositoryName: 'al2023-dev',
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.IMMUTABLE, // Enhanced security
      encryptionKey: ecrKmsKey, // Customer-managed KMS encryption
      lifecycleRules: [
        {
          description: 'Keep last 10 images',
          maxImageCount: 10,
          rulePriority: 1,
        },
        {
          description: 'Delete untagged images after 1 day',
          maxImageAge: cdk.Duration.days(1),
          rulePriority: 2,
          tagStatus: ecr.TagStatus.UNTAGGED,
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN for production
    });

    // Add repository policy for enhanced access control
    repository.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'DenyInsecureConnections',
      effect: iam.Effect.DENY,
      principals: [new iam.AnyPrincipal()],
      actions: ['*'],
      resources: ['*'],
      conditions: {
        Bool: {
          'aws:SecureTransport': 'false',
        },
      },
    }));

    // Restrict access to specific AWS account (current account)
    repository.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'RestrictToCurrentAccount',
      effect: iam.Effect.DENY,
      principals: [new iam.AnyPrincipal()],
      actions: ['*'],
      resources: ['*'],
      conditions: {
        StringNotEquals: {
          'aws:PrincipalAccount': this.account,
        },
      },
    }));

    // Output the repository URI
    new cdk.CfnOutput(this, 'RepositoryURI', {
      value: repository.repositoryUri,
      description: 'ECR Repository URI',
    });

    // Output the repository ARN
    new cdk.CfnOutput(this, 'RepositoryARN', {
      value: repository.repositoryArn,
      description: 'ECR Repository ARN',
    });

    // Output the KMS key ARN
    new cdk.CfnOutput(this, 'KMSKeyARN', {
      value: ecrKmsKey.keyArn,
      description: 'KMS Key ARN for ECR encryption',
    });
  }
}
