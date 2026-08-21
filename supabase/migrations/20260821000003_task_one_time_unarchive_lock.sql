-- Migration: 20260821000003_task_one_time_unarchive_lock.sql
-- Description: Adds unarchive_used boolean column to tasks table to enforce one-time unarchive lock.

ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS unarchive_used boolean NOT NULL DEFAULT false;
