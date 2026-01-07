import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    env[match[1]] = match[2]
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const { data, error } = await supabase
  .from('services')
  .update({ status: 'active' })
  .eq('status', 'pending')
  .select()

if (error) {
  console.error('Error:', error.message)
} else {
  const count = data ? data.length : 0
  console.log('Updated ' + count + ' pending services to active')
}
