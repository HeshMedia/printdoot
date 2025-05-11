import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'  // Use the shared client

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  const clerk = await clerkClient();
  // Check if the signing secret exists
  if (!SIGNING_SECRET) {
    return new Response('SIGNING_SECRET is missing', { status: 500 })
  }

  // Create Svix instance with the secret
  const wh = new Webhook(SIGNING_SECRET)

  // Extract headers from the request
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  // If headers are missing, return an error response
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing Svix headers', { status: 400 })
  }

  // Get the body of the request
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify the webhook payload with the provided headers
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent // Cast the result to WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Verification error', { status: 400 })
  }

  // Check event type
  if (evt.type !== 'user.created') {
    return new Response(`Event type ${evt.type} not supported`, { status: 400 })
  }

  // Extract and assert the type of evt.data
  const userData = evt.data as unknown as {
    id: string
    email_addresses: { email_address: string }[]
    first_name: string | null
    last_name: string | null
    phone_numbers: { phone_number: string }[] | undefined
  }
  
  const {
    id: clerkId,
    email_addresses,
    first_name,
    last_name,
    phone_numbers
  } = userData
  
  const email = email_addresses[0]?.email_address // Safe check for email_addresses
  const phone = phone_numbers && phone_numbers[0]?.phone_number || "+1234567890" // Default phone if missing

  // If there's no email, return an error
  if (!email) {
    return new Response('Email address is missing', { status: 400 })
  }
 
  // Insert data into the database (Prisma)
  try {
   
    const existing = await clerk.users.getUser(clerkId);

    // If they already have a role, skip the update
    if (!existing.publicMetadata?.role) {
      await clerk.users.updateUserMetadata(clerkId, {
        publicMetadata: { role: 'USER' }  // Note: Matches your userrole enum
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { clerkId }
    });
    
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return new Response('User already exists', { status: 200 });
    }
    
    // Create new user with required fields
    const user = await prisma.users.create({
      data: {
        clerkId,
        email,
        first_name: first_name || '',
        last_name: last_name || '',
        phone_number: phone,
        role: 'USER',  // Default role from your enum
      },
    });
    
    console.log('User successfully saved:', user);
  } catch (error) {
    console.error('Error saving user:', error);
    return new Response(`Error saving user: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }

  // Respond back to acknowledge that the webhook was received
  return new Response('Webhook received', { status: 200 });
}