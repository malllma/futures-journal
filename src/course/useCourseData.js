// useCourseData: loads and syncs course_progress and course_checklist
// from Supabase, with realtime updates for cross-device sync.

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useCourseData(userId) {
  const [progress, setProgress] = useState({}); // { m01: { status, quiz_best_score, ... }, ... }
  const [checklist, setChecklist] = useState({}); // { 'm01.t1': true, 'graduation.f1': true, ... }
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [progressRes, checklistRes] = await Promise.all([
        supabase.from('course_progress').select('*').eq('user_id', userId),
        supabase.from('course_checklist').select('*').eq('user_id', userId)
      ]);

      if (cancelled) return;

      if (progressRes.data) {
        const map = {};
        progressRes.data.forEach(row => { map[row.module_id] = row; });
        setProgress(map);
      }
      if (checklistRes.data) {
        const map = {};
        checklistRes.data.forEach(row => { if (row.checked) map[row.item_id] = true; });
        setChecklist(map);
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  // Realtime subscriptions
  useEffect(() => {
    if (!userId) return;

    const progressChannel = supabase
      .channel(`course_progress_${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'course_progress', filter: `user_id=eq.${userId}` },
        payload => {
          if (payload.eventType === 'DELETE') {
            setProgress(p => {
              const copy = { ...p };
              delete copy[payload.old.module_id];
              return copy;
            });
          } else {
            setProgress(p => ({ ...p, [payload.new.module_id]: payload.new }));
          }
        })
      .subscribe();

    const checklistChannel = supabase
      .channel(`course_checklist_${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'course_checklist', filter: `user_id=eq.${userId}` },
        payload => {
          if (payload.eventType === 'DELETE') {
            setChecklist(c => {
              const copy = { ...c };
              delete copy[payload.old.item_id];
              return copy;
            });
          } else {
            setChecklist(c => ({ ...c, [payload.new.item_id]: !!payload.new.checked }));
          }
        })
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(checklistChannel);
    };
  }, [userId]);

  // Toggle a checklist item
  const toggleChecklist = useCallback(async (itemId, checked) => {
    if (!userId) return;
    // Optimistic update
    setChecklist(c => {
      const copy = { ...c };
      if (checked) copy[itemId] = true; else delete copy[itemId];
      return copy;
    });

    if (checked) {
      await supabase.from('course_checklist').upsert(
        { user_id: userId, item_id: itemId, checked: true, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,item_id' }
      );
    } else {
      await supabase.from('course_checklist').delete().match({ user_id: userId, item_id: itemId });
    }
  }, [userId]);

  // Update module progress (status, quiz_best_score, etc.)
  const updateProgress = useCallback(async (moduleId, fields) => {
    if (!userId) return;
    const existing = progress[moduleId] || {};
    const updated = {
      user_id: userId,
      module_id: moduleId,
      status: existing.status || 'not_started',
      quiz_best_score: existing.quiz_best_score || 0,
      quiz_attempts: existing.quiz_attempts || 0,
      last_section: existing.last_section || 0,
      ...fields,
      updated_at: new Date().toISOString()
    };
    if (updated.status === 'completed' && !existing.completed_at) {
      updated.completed_at = new Date().toISOString();
    }

    setProgress(p => ({ ...p, [moduleId]: updated }));

    await supabase.from('course_progress').upsert(updated, { onConflict: 'user_id,module_id' });
  }, [userId, progress]);

  // Mark module as started (idempotent)
  const markStarted = useCallback((moduleId) => {
    const existing = progress[moduleId];
    if (!existing || existing.status === 'not_started') {
      updateProgress(moduleId, { status: 'in_progress' });
    }
  }, [progress, updateProgress]);

  // Record quiz attempt
  const recordQuizAttempt = useCallback((moduleId, score) => {
    const existing = progress[moduleId] || {};
    const newBest = Math.max(existing.quiz_best_score || 0, score);
    const newAttempts = (existing.quiz_attempts || 0) + 1;
    const passed = score >= 0.7;
    updateProgress(moduleId, {
      quiz_best_score: newBest,
      quiz_attempts: newAttempts,
      status: passed ? 'completed' : (existing.status === 'completed' ? 'completed' : 'in_progress')
    });
    return { passed, score, best: newBest };
  }, [progress, updateProgress]);

  return {
    progress,
    checklist,
    loading,
    toggleChecklist,
    markStarted,
    recordQuizAttempt,
    updateProgress
  };
}
