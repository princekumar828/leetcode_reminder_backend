const axios = require('axios');
const POTD = require('../models/potd');

// GraphQL query to get problem of the day info
const getProblemOfDayQuery = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      question {
        title
      }
    }
  }
`;

// GraphQL query for recent accepted submissions
const getRecentAcSubmissionsQuery = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      title
      timestamp
    }
  }
`;

// Function to get problem of the day
const getProblemOfDay = async () => {
  try {
    const response = await axios({
      url: 'https://leetcode.com/graphql',
      method: 'post',
      data: {
        query: getProblemOfDayQuery
      },
      timeout: 5000 // 5 second timeout
    });
    
    return {
      date: response.data.data.activeDailyCodingChallengeQuestion.date,
      title: response.data.data.activeDailyCodingChallengeQuestion.question.title
    };
  } catch (error) {
    console.error('Error fetching problem of the day:', error.message);
    throw error;
  }
};

// Function to get today's POTD from database
const getTodayPOTD = async () => {
  try {
    return await POTD.getTodayPOTD();
  } catch (error) {
    console.error('Error fetching POTD from database:', error.message);
    throw error;
  }
};

// Function to get recent accepted submissions
const getRecentAcceptedSubmissions = async (username, limit = 15) => {
  try {
    const response = await axios({
      url: 'https://leetcode.com/graphql',
      method: 'post',
      data: {
        query: getRecentAcSubmissionsQuery,
        variables: {
          username: username,
          limit: limit
        }
      },
      timeout: 5000 // 5 second timeout
    });
    
    return response.data.data.recentAcSubmissionList;
   
  } catch (error) {
    console.error('Error fetching recent submissions:', error.message);
    throw error;
  }
};

// Main function to check if problem of the day is solved
const isProblemOfDaySolved = async (username) => {
  try {
    const [recentSubmissions, potd] = await Promise.all([
      getRecentAcceptedSubmissions(username),
      getTodayPOTD()
    ]);
    
    if (!potd) {
      throw new Error('POTD not found in database');
    }
    
    // Parse POTD date in UTC
    const problemOfDayDate = new Date(potd.date);
    
    // Check if the problem of the day is in the recent submissions
    const isSolved = recentSubmissions.some(submission => {
      // Parse submission timestamp in UTC
      const submissionDate = new Date(submission.timestamp * 1000);
      
      // Check if submission is from today and matches the POTD title
      return submissionDate.getUTCDate() === problemOfDayDate.getUTCDate() &&
             submissionDate.getUTCMonth() === problemOfDayDate.getUTCMonth() &&
             submissionDate.getUTCFullYear() === problemOfDayDate.getUTCFullYear() &&
             submission.title === potd.title;
    });
    
    return {
      isSolved,
      problemOfDay: potd
    };
  } catch (error) {
    console.error('Error checking if POTD is solved:', error.message);
    throw error;
  }
};

module.exports = {
  getProblemOfDay,
  getTodayPOTD,
  getRecentAcceptedSubmissions,
  isProblemOfDaySolved
};