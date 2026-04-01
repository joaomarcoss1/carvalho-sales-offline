
DROP POLICY "Insert order items" ON public.order_items;
CREATE POLICY "Insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o 
    JOIN public.businesses b ON b.id = o.business_id 
    WHERE o.id = order_id AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);
