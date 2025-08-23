import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async () => {
  try {
    const { data, error } = await supabase
      .from('farts')
      .insert([{ date: new Date().toISOString().split('T')[0] }]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Counter incremented', data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
