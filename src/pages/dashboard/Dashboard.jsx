// src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getMeetings, createMeeting, deleteMeeting, getRecordings, getSubscriptionPortal, createCheckout } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Video, Clock, Users, Plus, Trash2, Play, Star } from 'lucide-react';

const SUBSCRIPTION_TIERS = {
  free: { name: 'Free', color: 'bg-gray-100 text-gray-800' },
  pro: { name: 'Pro', color: 'bg-blue-100 text-blue-800' },
  business: { name: 'Business', color: 'bg-purple-100 text-purple-800' },
};

export function Dashboard() {
  const { user, isLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState({ upcoming: [], past: [] });
  const [recordings, setRecordings] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: '', description: '', isInstant: true });
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [meetingsData, recordingsData] = await Promise.all([
        getMeetings('upcoming'),
        getRecordings().catch(() => ({ recordings: [] })),
      ]);
      setMeetings({ upcoming: meetingsData.meetings || [], past: [] });
      setRecordings(recordingsData.recordings || []);
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const meeting = await createMeeting(newMeeting);
      toast.success('Meeting created!');
      navigate(`/meeting/${meeting.slug}`);
    } catch (e) {
      toast.error(e.message || 'Failed to create meeting');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;
    try {
      await deleteMeeting(id);
      toast.success('Meeting cancelled');
      loadData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleUpgrade = async () => {
    try {
      const url = await createCheckout('pro', 'monthly');
      window.location.href = url;
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const url = await getSubscriptionPortal();
      window.location.href = url;
    } catch (e) {
      if (e.message.includes('No active subscription')) {
        handleUpgrade();
      } else {
        toast.error(e.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const tier = SUBSCRIPTION_TIERS[user.subscriptionTier] || SUBSCRIPTION_TIERS.free;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={tier.color}>{tier.name} Plan</Badge>
          <Button onClick={handleManageSubscription} variant="outline">
            Manage Subscription
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.upcoming.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordings.length}</div>
          </CardContent>
        </Card>
        {user.subscriptionTier === 'free' && (
          <Card className="border-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary">Upgrade to Pro</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Unlock more features</p>
              <Button onClick={handleUpgrade} size="sm">Upgrade Now</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Meeting</DialogTitle>
              <DialogDescription>Start an instant meeting or schedule for later</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <Input
                  placeholder="Meeting Title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Description (optional)"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isInstant"
                  checked={newMeeting.isInstant}
                  onChange={(e) => setNewMeeting({ ...newMeeting, isInstant: e.target.checked })}
                />
                <label htmlFor="isInstant" className="text-sm">Start immediately</label>
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating...' : newMeeting.isInstant ? 'Start Meeting' : 'Schedule Meeting'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Meetings</CardTitle>
          <CardDescription>Manage your upcoming and past meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={activeTab === 'past' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('past')}
            >
              Past
            </Button>
          </div>

          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {meetings.upcoming.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming meetings. Create one to get started!
                </p>
              ) : (
                meetings.upcoming.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {meeting.scheduled_start && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(meeting.scheduled_start).toLocaleString()}
                            </span>
                          )}
                          {meeting.scheduled_start && meeting.scheduled_end && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.round((new Date(meeting.scheduled_end) - new Date(meeting.scheduled_start)) / 60000)} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/meeting/${meeting.meeting_link_slug}`}>Join</Link>
                      </Button>
                      {meeting.host_user_id === user.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div className="space-y-4">
              {meetings.past.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No past meetings
                </p>
              ) : (
                meetings.past.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-4 border rounded-lg opacity-75"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.ended_at || meeting.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
