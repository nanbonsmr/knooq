-- Update is_pro_user function to handle cancelled subscriptions properly
-- Cancelled users keep access until current_period_end, then automatically downgrade
CREATE OR REPLACE FUNCTION public.is_pro_user(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = check_user_id
      AND (
        -- Active subscriptions: access if period hasn't ended
        (status = 'active' AND (current_period_end IS NULL OR current_period_end > now()))
        OR
        -- Cancelled subscriptions: access only until period ends (grace period)
        (status = 'cancelled' AND current_period_end IS NOT NULL AND current_period_end > now())
      )
  )
$function$;