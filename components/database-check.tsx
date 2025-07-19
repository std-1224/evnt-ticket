'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function DatabaseCheck() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [tableExists, setTableExists] = useState<boolean | null>(null)

  const checkTable = async () => {
    setLoading(true)
    setStatus('Checking if users table exists...')
    
    try {
      // Try to select from users table
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          setTableExists(false)
          setStatus('❌ Users table does not exist')
        } else {
          setTableExists(false)
          setStatus(`❌ Database error: ${error.message}`)
        }
      } else {
        setTableExists(true)
        setStatus('✅ Users table exists and is accessible')
      }
    } catch (err: any) {
      setTableExists(false)
      setStatus(`❌ Connection error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testInsert = async () => {
    setLoading(true)
    setStatus('Testing user insert...')
    
    try {
      // Try to insert a test user
      const testUser = {
        id: crypto.randomUUID(),
        full_name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        role: 'buyer'
      }

      const { data, error } = await supabase
        .from('users')
        .insert([testUser])
        .select()

      if (error) {
        setStatus(`❌ Insert failed: ${error.message}`)
        console.error('Insert error details:', error)
      } else {
        setStatus('✅ Test insert successful!')
        console.log('Inserted user:', data)
        
        // Clean up test user
        await supabase
          .from('users')
          .delete()
          .eq('id', testUser.id)
      }
    } catch (err: any) {
      setStatus(`❌ Insert test failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Database Check</CardTitle>
        <CardDescription>Verify your database setup</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={checkTable} 
            disabled={loading}
            className="w-full"
          >
            Check Users Table
          </Button>
          
          {tableExists && (
            <Button 
              onClick={testInsert} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Test Insert
            </Button>
          )}
        </div>

        {status && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-mono">{status}</p>
          </div>
        )}

        {tableExists === false && (
          <Alert>
            <AlertDescription>
              The users table doesn't exist. Please run the SQL commands from the setup instructions to create it.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Project:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'Unknown'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
