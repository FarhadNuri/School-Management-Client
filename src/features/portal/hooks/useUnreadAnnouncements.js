import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePortalRole } from './usePortalRole';
import { useAnnouncements } from './usePortalQueries';

const EVENT_NAME = 'announcements-read-updated';

function getStoredReadIds(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`read_announcements_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistReadIds(userId, ids) {
  if (!userId) return;
  try {
    localStorage.setItem(`read_announcements_${userId}`, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { userId, ids } }));
  } catch (err) {
    console.error('Failed to save read announcements:', err);
  }
}

export function useUnreadAnnouncements() {
  const { user } = usePortalRole();
  const userId = user?.id || user?._id || user?.email || user?.role || 'default_user';
  const { data: announcementsData, isLoading, refetch } = useAnnouncements();

  const [readIds, setReadIds] = useState(() => getStoredReadIds(userId));

  useEffect(() => {
    setReadIds(getStoredReadIds(userId));
  }, [userId]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (!e?.detail?.userId || e.detail.userId === userId) {
        setReadIds(getStoredReadIds(userId));
      }
    };

    const handleStorage = (e) => {
      if (e.key === `read_announcements_${userId}`) {
        setReadIds(getStoredReadIds(userId));
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [userId]);

  const allAnnouncements = useMemo(() => {
    return Array.isArray(announcementsData?.announcements)
      ? announcementsData.announcements
      : [];
  }, [announcementsData]);

  const readSet = useMemo(() => new Set(readIds.map(String)), [readIds]);

  const unreadAnnouncements = useMemo(() => {
    return allAnnouncements.filter((a) => {
      const id = String(a.id || a._id || '');
      return id && !readSet.has(id);
    });
  }, [allAnnouncements, readSet]);

  const unreadCount = unreadAnnouncements.length;

  const isRead = useCallback(
    (id) => {
      if (!id) return false;
      return readSet.has(String(id));
    },
    [readSet]
  );

  const markAsRead = useCallback(
    (id) => {
      if (!id) return;
      const strId = String(id);
      setReadIds((prev) => {
        const nextSet = new Set(prev.map(String));
        if (nextSet.has(strId)) return prev;
        nextSet.add(strId);
        const nextList = Array.from(nextSet);
        persistReadIds(userId, nextList);
        return nextList;
      });
    },
    [userId]
  );

  const markAllAsRead = useCallback(() => {
    const ids = allAnnouncements.map((a) => String(a.id || a._id)).filter(Boolean);
    setReadIds((prev) => {
      const nextSet = new Set([...prev.map(String), ...ids]);
      const nextList = Array.from(nextSet);
      persistReadIds(userId, nextList);
      return nextList;
    });
  }, [allAnnouncements, userId]);

  return {
    unreadCount,
    totalCount: allAnnouncements.length,
    unreadAnnouncements,
    allAnnouncements,
    isRead,
    markAsRead,
    markAllAsRead,
    isLoading,
    refetch
  };
}

export default useUnreadAnnouncements;

