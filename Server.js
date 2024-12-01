const express = require('express');
const MusResponse = require('./Responses/MusResponse.js');
const LegacyResponse = require('./Responses/ResponseLegacy.js')
const UserLogin = require('./Responses/UserLogin.js');
const app = express();
const port = 3000;
const config = require('./config.json')
const fs = require('fs');
const bcrypt = require('bcrypt');
const util = require('util');
const readFile = util.promisify(fs.readFile); 
const Dicer = require('dicer');  // Import dicer module
async function Login(username, password) {
    try {
        const data = await readFile(`./users/${username}.json`, 'utf-8');
        const user = JSON.parse(data);
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return user;
        } else {
            console.log('Password doesn\'t match');
            return null;
        }
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post("/v2/login.do", async (req, res) => {
  let username = req.body.username;
  const password = req.body.password;
  username = username.replace("@", "");

  try {
      const user = await Login(username, password); // Await the `Login` function

      if (!user) {
          const resp = new LegacyResponse(
              '403',
              'Failed to log in',
              'Incorrect password or username',
              false,
              false,
              {},
              true,
              Date.now()
          );
          return res.json(resp.toObject());
      } else {
          const resp = new LegacyResponse(
              '200',
              'ok',
              'ok',
              false,
              false,
              user,
              true,
              Date.now()
          );
          return res.json(resp.toObject());
      }
  } catch (err) {
      console.error('Error during login:', err);
      const resp = new LegacyResponse(
          '500',
          'Server error',
          'An unexpected error occurred',
          false,
          false,
          {},
          true,
          Date.now()
      );
      return res.json(resp.toObject());
  }
});

app.get("/rest/v2/musicals/*",(req,res)=>{
    const resp = new LegacyResponse('200','ok','ok',false,false,{
        "content":[
            {
              "musicalId": 1,
              "musicalIdStr": "1",
              "caption": "",
              "width": 526,
              "height": 360,
              "videoUri": "http://cdn.zrd.ovh/cyka.mp4",
              "thumbnailUri": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.informer.com%2Ficons%2Fpng%2F48%2F3128%2F3128694.png&f=1&nofb=1&ipt=32202d96370fcd91fc6d4ab8275849743179c841b16fe9fb1bec5a86cb7ff751&ipo=images",
              "startTime": 0,
              "track": {
                "foreignId": "0",
                "source": "",
                "trackId": 0,
                "previewUri": "",
                "author": {
                  "foreignId": "0",
                  "source": "",
                  "artistId": 0,
                  "name": "whatever"
                },
                "song": {
                  "foreignId": "0",
                  "source": "",
                  "songId": 0,
                  "title": "whatever"
                },
                "album": {
                  "foreignId": "0",
                  "source": "",
                  "albumId": 0,
                  "title": "whatever",
                  "thumbnailUri": ""
                },
                "sequence": 0
              },
              "trackId": 0,
              "author": {
                "admin": false,
                "bid": "1",
                "blocked": false,
                "commentsNum": 0,
                "complimented": false,
                "disabled": false,
                "email": "example@example.com",
                "emailVerified": false,
                "fansNum": 0,
                "featuredScope": 0,
                "featuredTime": "2024-12-01T00:00:00Z",
                "followList": [],
                "followNum": 0,
                "followed": false,
                "following": false,
                "gender": "male",
                "handle": "ZRD1337",
                "handleModified": "2024-12-01T00:00:00Z",
                "icon": "https://example.com/icon.png",
                "inCn": false,
                "instagramID": "ZRD1337", // instagram tag
                "introduction": "",
                "likesNum": 0,
                "musicalLikedNum": 0,
                "musicalNum": 1,
                "musicalReadNum": 0,
                "name": "ZRD",
                "nickName": "ZRD",
                "password": "examplePassword",
                "phone": "123-456-7890",
                "postNotify": false,
                "readNum": 0,
                "realName": "ExampleRealName",
                "reviewer": false,
                "sociaMediaList": [],
                "subscribeList": [],
                "userDesc": "Hello",
                "userId": 1,
                "userSettingDTO": {
                  "userId": 58210,
                  "secret": false,
                  "duet": false,
                  "hideLocation": false,
                  "privateChat": false,
                  "policyVersion": 1
                },
                "userRequestDTO": {
                  "follow": false
                },
                "verified": false
              },
              "authorId": 58210,
              "status": 2,
              "promoted": false,
              "promoteType": 0,
              "indexTime": 1418323776000,
              "liked": false,
              "owned": false,
              "likedNum": 2,
              "readNum": 0,
              "commentNum": 0,
              "remixFrom": 0,
              "musicalSource": "MLServer",
              "clientCreateTime": 1418148829000,
              "bid": "MzI5ODE2MDE3Mw",
              "videoSource": 1,
              "appliedFilter": "country",
              "appVersion": "3.5.1",
              "ost": false,
              "musicalType": 0,
              "duet": false 
            }],
    },true,Date.now())
    res.json(resp.toObject())
})
app.all("/device/*",(req,res)=>{
    res.json(new LegacyResponse('404','ok','ok',false,false,{},true,Date.now()).toObject())
})
app.post('/rest/v2/musicals/', (req, res) => {
  if (req.headers['content-type'].startsWith('multipart/mixed')) {
      const boundary = req.headers['content-type'].split('boundary=')[1];
      const dicer = new Dicer({ boundary });

      var result = {};

      req.pipe(dicer);

      dicer.on('part', (part) => {
          let fieldName = null;
          let data = '';

          // Read each part
          part.on('data', (chunk) => {
              data += chunk.toString();
          });

          part.on('end', () => {
              // Check if the part is a JSON field (e.g., 'musical')
              console.log(data)
              result = JSON.parse(data);
          });

          part.on('header', (headers) => {
              // Extract the field name (e.g., from form-data headers)
              if (headers['content-disposition']) {
                  const contentDisposition = headers['content-disposition'];
                  const match = contentDisposition.match= /name="([^"]+)"/;
                  if (match && match[1]) {
                      fieldName = match[1];
                  }
              }
          });
      });

      dicer.on('finish', () => {
          
          if (result) {
            result.videoCoverTicket.endpoint = "http://192.168.0.20/idfk1"
            result.videoTicket.endpoint = "http://192.168.0.20/idfk2"
            result.videoCoverTicket.headers = {}
            result.videoTicket.headers = {}
            result.videoCoverTicket.method = "POST"
            result.videoTicket.method = "POST"
            result.videoCoverTicket.parameters = {}
            result.videoTicket.parameters = {}
            result.videoCoverTicket.presignedUrl = "http://192.168.0.20/idfk1"
            result.videoTicket.presignedUrl = "http://192.168.0.20/idfk2"
            result.videoCoverTicket.resourcePath = "http://192.168.0.20/idfk1"
            result.videoTicket.resourcePath = "http://192.168.0.20/idfk2"
            result.musical.bid = '10'
            result.musical.author = {
              "admin": false,
              "bid": "1",
              "blocked": false,
              "commentsNum": 0,
              "complimented": false,
              "disabled": false,
              "email": "example@example.com",
              "emailVerified": false,
              "fansNum": 0,
              "featuredScope": 0,
              "featuredTime": "2024-12-01T00:00:00Z",
              "followList": [],
              "followNum": 0,
              "followed": false,
              "following": false,
              "gender": "male",
              "handle": "ZRD1337",
              "handleModified": "2024-12-01T00:00:00Z",
              "icon": "",
              "inCn": false,
              "instagramID": "ZRD1337",
              "introduction": "",
              "likesNum": 0,
              "musicalLikedNum": 0,
              "musicalNum": 0,
              "musicalReadNum": 0,
              "name": "ZRD",
              "nickName": "ZRD",
              "password": "$2b$10$enBW5TwyzUDZNRS3UPCOVepgLMENsCTZOf5FY1QvCqZX0DEMx2yGK",
              "phone": "",
              "postNotify": false,
              "readNum": 0,
              "realName": "",
              "reviewer": false,
              "sociaMediaList": [],
              "subscribeList": [],
              "userDesc": "",
              "userId": 0,
              "userSettingDTO": {
                  "userId": 0,
                  "secret": false,
                  "duet": false,
                  "hideLocation": false,
                  "privateChat": false,
                  "policyVersion": 1
              },
              "userRequestDTO": {
                  "follow": false
              },
              "verified": false
          }
          result.musical.musicalId = '10'
          
            result.trackCoverTicket = result.videoTicket
            result.trackPreviewTicket = result.videoTicket
              res.json(new LegacyResponse('200','ok','ol',false,false,result,true,Date.now()));
          } else {
              res.status(400).json({ error: 'No musical data found' });
          }
      });

      dicer.on('error', (err) => {
          console.error('Error parsing multipart data:', err);
          res.status(400).json({ error: 'Error parsing multipart data' });
      });
  } else {
      res.status(415).json({ error: 'Unsupported Content-Type' });
  }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
