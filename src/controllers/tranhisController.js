const jwt = require('jsonwebtoken');
const user = require('../models/user');
const transaction = require('../models/transaction');
const {get_access_token} = require('../lib/getAccessToken');
const axios = require('axios');
const _ = require('lodash');
exports.tranhis = async (req, res) => {
    try{
        const {token, fromDate, toDate, inSystem} = req.body;
        console.log(new Date().toLocaleDateString());
        const {email, accountNo} = jwt.verify(token, process.env.SECRET_JWT);
        const existUser = await user.findOne({email: email});
        if(existUser){
            if(inSystem=='true'){
                // convert date from DD-MM-YYY to YYYY-MM-DD
                const newToDate = toDate.split("-").reverse().join("-");
                const newFromDate = fromDate.split("-").reverse().join("-");
                console.log(newToDate, newFromDate);
                const existTransaction = await transaction.find({accountNo: accountNo, date: { $gte: newFromDate, $lte: newToDate }});
                if(existTransaction){
                    res.json({responseCode:"00" ,message: 'Success', data:{ transHis: existTransaction}});
                }else{
                    res.json({responseCode:"21" ,message: 'No transaction'});
                }
            }else{
                const accessToken = await get_access_token();
                const newFromDate = fromDate.split('-').join('');
                const newToDate = toDate.split('-').join('');
                const response = await axios.post(
                    'https://7ucpp7lkyl.execute-api.ap-southeast-1.amazonaws.com/dev/tranhis',
                    {
                        'data': {
                            'acctNo': '068704070000489',
                            'fromDate': newFromDate,
                            'toDate': newToDate
                        },
                        'request': {
                            'requestId': 'a7ea23df-7468-439d-9b12-26eb4a760901',
                            'requestTime': '1667200102200'
                        }
                    },
                    {
                        headers: {
                            'accept': 'application/json',
                            'access-token': accessToken,
                            'x-api-key': 'hutech_hackathon@123456',
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(newFromDate, newToDate);
                if(response.data.response.responseCode == '00'){
                    res.json({responseCode:"00" ,message: 'Success', data: response.data.data});
                }else{
                    res.json({responseCode:"21" ,message: response.data.response.responseMessage});
                }
            }
        }
    }catch(err){
        console.log(err);
        res.json({ responseCode: '99', responseMessage: 'Server error' });
    }
};