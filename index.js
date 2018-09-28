'use strict';

const line = require('@line/bot-sdk');

const admin = require('firebase-admin')
const functions = require('firebase-functions');
admin.initializeApp(functions.config().firebase)

const db = admin.firestore();
const co = require('co')


const config = {
    channelAccessToken: 'J1sQstLyJMnAT1glEk5M7Vk1ADr/yVnsGVYipjX3jhGMM2TBe6j+EIB1EpG4GDoIo7AsoajmMgV0kEPvjMX3LRMIgpTcKnC/Ya6MttKPtb3tv1LVl0w88CrpaLpZkgaWF+GqSaLTatJbEgITLwFC/AdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'e9bf3b37bf06be3bf29f4b6fcfbf7b69',
};

const client = new line.Client(config);



function handleEvent(event) {

    co(function*() {
        var echo = '';
        if (event.type === 'message' && event.message.type === 'text') {

            if(event.message.text === '本人確認を行います'){
                echo = buildTextMessage('IDを入力してください');
            }else if(event.message.text === '過去の支払い履歴を表示します'){
                console.log("proc1")
                var invoices = yield db.collection("invoices").orderBy('id').get();
                echo = buildInvoicesMessage(invoices)
            }else if(event.message.text === '1'){
                echo = buildTextMessage('パスワードを入力してください');
            }else if(event.message.text === '2'){
                echo = buildSelectableMessage("すずや保育園の街田絵里さんですね？");
            }else if(event.message.text === 'はい'){
                echo = buildTextMessage('すずや保育園から2018年8月の延長保育の請求です。【12,800円】。お支払いはこちらからお願いします。\r\nhttps://vocal-plateau-91708.firebaseapp.com/creditCard.html');
            }else{
                echo = buildTextMessage('申し訳ありませんが、現在未対応となります');
            }
        }
        console.log("proc4")
            return client.replyMessage(event.replyToken,echo);

    }).catch(console.error)

}

function buildInvoicesMessage(invoices){

    // var docRef =yield db.collection('invoices').add({
    //     "id": 2,
    //     "amount": 15678
    // })
        console.log("proc2")
        var invoices_list_text = '';
        invoices.forEach((doc) => {
            var row = doc.data().year_month + " " + doc.data().amount + "円" + "\r\n"
            invoices_list_text = invoices_list_text + row
        });
        console.log("proc3")
        return buildTextMessage(invoices_list_text);

}

function buildTextMessage(caption){
    return { type: 'text', text: caption };
}

function buildSelectableMessage(caption) {

    return {
        "type": "template",
        "altText": "this is a confirm template",
        "template": {
            "type": "confirm",
            "actions": [
                {
                    "type": "message",
                    "label": "はい",
                    "text": "はい"
                },
                {
                    "type": "message",
                    "label": "いいえ",
                    "text": "いいえ"
                }
            ],
            "text": caption
        }
    }
}

exports.test = functions.https.onRequest((req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then(result => res.status(200).send(`Success: ${result}`))
        .catch((err) => {
            console.log(err);
            res.status(400).send(err.toString())
        });
});

