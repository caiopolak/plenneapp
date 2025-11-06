import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Process Scheduled Transactions Function Started')

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting scheduled transactions processing...')
    
    // ========================================
    // PARTE 1: Processar Transações Recorrentes
    // ========================================
    console.log('Processing recurring transactions...')
    
    const { error: recurringError } = await supabaseClient.rpc('create_recurring_transactions')
    
    if (recurringError) {
      console.error('Error processing recurring transactions:', recurringError)
      throw recurringError
    }
    
    console.log('✅ Recurring transactions processed successfully')
    
    // ========================================
    // PARTE 2: Auto-confirmar Transações Agendadas
    // ========================================
    console.log('Processing incoming transactions...')
    
    const today = new Date().toISOString().split('T')[0]
    
    // Buscar transações pendentes que chegaram na data ou estão atrasadas
    const { data: pendingTransactions, error: fetchError } = await supabaseClient
      .from('incoming_transactions')
      .select('*')
      .eq('status', 'pending')
      .lte('expected_date', today)
    
    if (fetchError) {
      console.error('Error fetching incoming transactions:', fetchError)
      throw fetchError
    }
    
    console.log(`Found ${pendingTransactions?.length || 0} pending transactions to process`)
    
    let processedCount = 0
    let errorCount = 0
    
    // Processar cada transação pendente
    if (pendingTransactions && pendingTransactions.length > 0) {
      for (const incoming of pendingTransactions) {
        try {
          console.log(`Processing transaction ${incoming.id} for user ${incoming.user_id}`)
          
          // 1. Criar a transação real
          const { error: insertError } = await supabaseClient
            .from('transactions')
            .insert({
              user_id: incoming.user_id,
              workspace_id: incoming.workspace_id,
              type: incoming.type,
              amount: incoming.amount,
              category: incoming.category,
              description: incoming.description,
              date: incoming.expected_date, // Usa a data prevista
              is_recurring: false
            })
          
          if (insertError) {
            console.error(`Error creating transaction for ${incoming.id}:`, insertError)
            errorCount++
            continue
          }
          
          // 2. Marcar como confirmada
          const { error: updateError } = await supabaseClient
            .from('incoming_transactions')
            .update({ status: 'confirmed' })
            .eq('id', incoming.id)
          
          if (updateError) {
            console.error(`Error updating status for ${incoming.id}:`, updateError)
            errorCount++
            continue
          }
          
          processedCount++
          console.log(`✅ Transaction ${incoming.id} processed successfully`)
          
        } catch (error) {
          console.error(`Error processing transaction ${incoming.id}:`, error)
          errorCount++
        }
      }
    }
    
    console.log(`✅ Incoming transactions processed: ${processedCount} successful, ${errorCount} errors`)
    
    // ========================================
    // RETORNO FINAL
    // ========================================
    const result = {
      success: true,
      message: 'Scheduled transactions processing completed',
      recurringProcessed: true,
      incomingTransactions: {
        total: pendingTransactions?.length || 0,
        processed: processedCount,
        errors: errorCount
      },
      timestamp: new Date().toISOString()
    }
    
    console.log('Final result:', result)
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Fatal error in process-scheduled-transactions:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
