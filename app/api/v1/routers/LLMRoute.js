const express = require('express');
const {sendMessage} = require('../controllers/chatbotController')
const {GenerateQuestions , AnalysisAssessment} = require('../controllers/assessmentController')
const LLMRoute = express.Router();

LLMRoute.post('/chatting' , sendMessage);
LLMRoute.get('/generate/assessment' , GenerateQuestions);
LLMRoute.post('/analyze/assessment' , AnalysisAssessment);


module.exports = LLMRoute ;