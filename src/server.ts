import express, { Router, Request, Response } from 'express';
import type { ServerConfig } from './common/types';
import { createTokenRoute } from './routes/token';
import { createTwimlRoute } from './routes/twiml';
import { createLogMiddleware } from './middlewares/log';
import { auth } from 'express-oauth2-jwt-bearer';
import {twiml} from 'twilio';

export function createExpressApp(serverConfig: ServerConfig) {
  const app = express();
  console.log("$$$", serverConfig);
  const {VoiceResponse} = twiml;

  const jwtCheck = auth({
    audience: serverConfig.AUTH0_AUDIENCE,
    issuerBaseURL: serverConfig.AUTH0_ISSUER_BASE_URL,
  });

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  /**
   * When testing locally using a tool like `ngrok`, `ngrok` acts as a proxy in
   * front of this `express` app.
   *
   * Configure the following line according to your environment, development or
   * production.
   *
   * Please see the official Express documentation for more information.
   * https://expressjs.com/en/guide/behind-proxies.html
   */
  app.set('trust proxy', 1);

  app.use(createLogMiddleware());

  const tokenRouter = Router();
  tokenRouter.use(createTokenRoute(serverConfig));
  app.post('/token', jwtCheck, tokenRouter);

  const twimlRouter = Router();
  twimlRouter.use(createTwimlRoute(serverConfig));
  app.post('/twiml', twimlRouter);

  app.post('/voice', (request: Request, response: Response) => {
    // Use the Twilio Node.js SDK to build an XML response
    console.log("voice:", request.body, request.route);
    // const twiml = new VoiceResponse();
    // twiml.say('Hello world! Use the Twilio Node.js SDK to build an XML response. Use the Twilio Node.js SDK to build an XML response. Use the Twilio Node.js SDK to build an XML response.');


    const twiml = new VoiceResponse();
    // twiml.dial('516-945-9137');
    twiml.dial({
      callerId: '+15855662720', // Your Twilio phone number
    }, '+16209569684'); // Replace with the real phone number you want to call  
    twiml.say('Hello world! Use the Twilio Node.js SDK to build an XML response.');

    // Render the response as XML in reply to the webhook request
    response.type('text/xml');
    response.send(twiml.toString());
  });
  
  app.post('/record', (request, response) => {
      // Use the Twilio Node.js SDK to build an XML response
      const twiml = new VoiceResponse();
      twiml.say('Hello. Please leave a message after the beep.');

      // Use <Record> to record and transcribe the caller's message
      twiml.record({ transcribe: true, maxLength: 30 });

      // End the call with <Hangup>
      twiml.hangup();

      // Render the response as XML in reply to the webhook request
      response.type('text/xml');
      response.send(twiml.toString());
  });

 
  app.post('/revenuecat', (req, res) => {
    console.log("############################################")
    console.log(req.body)
    res.send(200);
  })
  return app;
}
