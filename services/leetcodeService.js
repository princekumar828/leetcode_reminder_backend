const axios = require('axios');

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
      }
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
      }
    });
    
    //console.log('Recent accepted submissions:', response.data.data.recentAcSubmissionList);
    return response.data.data.recentAcSubmissionList;
   
  } catch (error) {
    console.error('Error fetching recent submissions:', error.message);
    throw error;
  }
};

// Main function to check if problem of the day is solved
const isProblemOfDaySolved = async (username) => {
  try {
    const recentSubmissions = await getRecentAcceptedSubmissions(username);
    const problemOfDay = await getProblemOfDay();
    
    // Parse POTD date in UTC
    const problemOfDayDate = new Date(problemOfDay.date);
    
    // Check if the problem of the day is in the recent submissions
    const isSolved = recentSubmissions.some(submission => {
      // Parse submission timestamp in UTC
      const submissionDate = new Date(submission.timestamp * 1000);
      
      return submission.title === problemOfDay.title && 
             submissionDate.getUTCFullYear() >= problemOfDayDate.getUTCFullYear() &&
             submissionDate.getUTCMonth() >= problemOfDayDate.getUTCMonth() &&
             submissionDate.getUTCDate() >= problemOfDayDate.getUTCDate();
    });

    return {isSolved, problemOfDay};
  } catch (error) {
    console.error('Error checking if problem of the day is solved:', error.message);
    return {
      isSolved: false,
      problemOfDay: null
    };
  }
};

module.exports = {
  getProblemOfDay,
  getRecentAcceptedSubmissions,
  isProblemOfDaySolved
};