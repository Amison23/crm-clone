-- Migration: 20260821000004_task_tokenized_unarchive_lock.sql
-- Description: Adds unarchive_count and max_unarchives columns to tasks for tokenized unarchive locking.

ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS unarchive_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_unarchives integer NOT NULL DEFAULT 5;
