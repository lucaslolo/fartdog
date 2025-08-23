import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function handler() {
  try {
    // récupère la ligne du compteur global
    let { data, error } = await supabase
      .from('counter')
      .select('value')
      .eq('id', 1)
      .single();

    if (error) throw new Error(error.message);

    const newValue = (data.value ?? 0) + 1;

    const { error: updateError } = await supabase
      .from('counter')
      .update({ value: newValue })
      .eq('id', 1);

    if (updateError) throw new Error(updateError.message);

    return {
      statusCode: 200,
      body: JSON.stringify({ value: newValue }),
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
}