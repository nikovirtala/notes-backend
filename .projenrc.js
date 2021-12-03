const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '2.0.0',
  defaultReleaseBranch: 'main',
  jsiiFqn: 'projen.AwsCdkTypeScriptApp',
  name: 'notes-backend',
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': 'true',
  },
  authorEmail: 'niko.virtala@hey.com',
  authorName: 'Niko Virtala',
  authorUrl: 'https://www.cloudgardener.dev/',
  deps: ['aws-sdk', '@aws-cdk/aws-appsync-alpha@2.0.0-alpha.11'],
  devDeps: ['prettier', 'esbuild@0'],
  license: 'MIT',
  licensed: true,
  repository: 'https://github.com/nikovirtala/notes-backend',
  codeCov: false,
  dependabot: false,
  dependabotOptions: { scheduleInterval: 'weekly' },
  jest: false,
  pullRequestTemplate: false,
  rebuildBot: false,
  readme: false,
  mergify: true,
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
      secret: 'AUTOMATION_TOKEN',
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['nikovirtala'],
  },
  eslint: true,
  eslintOptions: {
    prettier: true,
  },
});

project.synth();
