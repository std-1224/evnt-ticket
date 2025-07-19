'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SupabaseTest() {
  const [status, setStatus] = useState<string>('Not tested')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setStatus('Testing...')
    
    try {
      // Test basic connection
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setStatus(`Error: ${error.message}`)
      } else {
        setStatus('✅ Supabase connection successful!')
      }
    } catch (err: any) {
      setStatus(`❌ Connection failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testDatabase = async () => {
    setLoading(true)
    setStatus('Testing database...')
    
    try {
      // Test database connection by trying to select from users table
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        setStatus(`❌ Database error: ${error.message}`)
      } else {
        setStatus('✅ Database connection successful!')
      }
    } catch (err: any) {
      setStatus(`❌ Database test failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>Test your Supabase configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={testConnection} 
            disabled={loading}
            className="w-full"
          >
            Test Auth Connection
          </Button>
          <Button 
            onClick={testDatabase} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Test Database Connection
          </Button>
        </div>
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-mono">{status}</p>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
          <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
