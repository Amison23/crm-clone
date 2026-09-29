CREATE POLICY "tasks_select" ON tasks FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = auth.uid()
      AND e.company_id = tasks.company_id
      AND (
        tasks.assigned_to = auth.uid()
        OR tasks.created_by = auth.uid()
        OR e.role IN ('admin','superadmin')
      )
  )
);
