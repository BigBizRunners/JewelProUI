import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'ap-south-1_i8u4BbJ0z',  // Replace with your User Pool ID
    ClientId: '33ruc7ifhucs6v0anoes8bh26f'    // Replace with your App Client ID
};

const userPool = new CognitoUserPool(poolData);

export default userPool;
