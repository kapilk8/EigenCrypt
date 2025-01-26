const { ethers } = require('ethers');
const EigenLayerABI = require('../contracts/EigenLayerABI.json');
const logger = require('../utils/logger');

class EigenLayerService {
  constructor() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID'
      );
      
      this.contract = new ethers.Contract(
        process.env.EIGENLAYER_CONTRACT_ADDRESS, 
        EigenLayerABI, 
        provider
      );
    } catch (error) {
      logger.error('Failed to initialize EigenLayer service', { error: error.message });
      throw error;
    }
  }

  async validateTask(taskParameters) {
    try {
      // Comprehensive task validation
      if (!taskParameters || typeof taskParameters !== 'object') {
        logger.warn('Invalid task parameters', { taskParameters });
        return false;
      }

      // Required parameter checks
      const requiredParams = [
        'computationType', 
        'dataSize', 
        'complexity', 
        'requiredStake'
      ];

      for (const param of requiredParams) {
        if (!taskParameters.hasOwnProperty(param)) {
          logger.warn(`Missing required task parameter: ${param}`, { taskParameters });
          return false;
        }
      }

      // Type and range validations
      if (
        typeof taskParameters.computationType !== 'string' ||
        typeof taskParameters.dataSize !== 'number' ||
        typeof taskParameters.complexity !== 'number' ||
        typeof taskParameters.requiredStake !== 'number'
      ) {
        logger.warn('Invalid parameter types', { taskParameters });
        return false;
      }

      // Additional contract-level validation
      try {
        const isValid = await this.contract.validateTask(taskParameters);
        return isValid;
      } catch (contractError) {
        logger.error('Contract validation failed', { 
          error: contractError.message, 
          taskParameters 
        });
        return false;
      }
    } catch (error) {
      logger.error('Task validation error', { 
        error: error.message, 
        taskParameters 
      });
      return false;
    }
  }

  async claimTaskReward(task) {
    try {
      if (!task || !task._id || !task.reward) {
        logger.warn('Invalid task for reward claiming', { task });
        return false;
      }

      const rewardAmount = task.reward;
      
      // Enhanced error handling and logging
      try {
        const tx = await this.contract.claimReward(
          task._id.toString(), 
          rewardAmount
        );

        const receipt = await tx.wait();
        
        logger.info('Reward claimed successfully', {
          taskId: task._id,
          amount: rewardAmount,
          transactionHash: receipt.transactionHash
        });

        return true;
      } catch (contractError) {
        logger.error('Reward claim contract error', {
          error: contractError.message,
          taskId: task._id,
          amount: rewardAmount
        });
        return false;
      }
    } catch (error) {
      logger.error('Reward claim error', { 
        error: error.message, 
        taskId: task?._id 
      });
      return false;
    }
  }
}

module.exports = new EigenLayerService(); 