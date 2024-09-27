import type { NextApiRequest, NextApiResponse } from 'next'
import Pusher from 'pusher'; 
import { adjetives, animals } from '../../../utils/namedata';
import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.NEXT_PUBLIC_APP_KEY,
  secret: process.env.APP_SECRET,
  cluster: process.env.NEXT_PUBLIC_APP_CLUSTER,
  useTLS: true,
});

function generateRandomName(): string {
  return adjetives[Math.floor(adjetives.length*Math.random())] + " " + animals[Math.floor(animals.length*Math.random())]
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const presenceData = {
    user_id: uuidv4(),
    user_info: { name: generateRandomName()},
  };
  // This authenticates every user. Don't do this in production!
  const authResponse = pusher.authorizeChannel(socketId, channel, presenceData);
  console.log(authResponse)
    res.status(200).json(authResponse)
  } else {
    // Handle any other HTTP method
  }
}

