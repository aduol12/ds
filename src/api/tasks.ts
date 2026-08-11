import { client } from './client';

export type FieldTaskStatus =
  | 'New'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type FieldTaskPriority = 'High' | 'Medium' | 'Low';

export type FieldTask = {
  id: string;
  title: string;
  task_type: string;
  description?: string | null;
  farm_id?: string | null;
  farm_name?: string | null;
  assignee_user_id?: string | null;
  assignee_name?: string | null;
  created_by_user_id: string;
  priority: FieldTaskPriority;
  due_date?: string | null;
  status: FieldTaskStatus;
  created_at?: string;
  updated_at?: string;
};

export async function listTasks(): Promise<FieldTask[]> {
  const response = await client.get('/api/tasks');
  return Array.isArray(response.data) ? response.data : [];
}

export async function createTask(data: {
  title: string;
  task_type?: string;
  description?: string;
  farm_id?: string;
  assignee_user_id?: string;
  priority?: FieldTaskPriority;
  due_date?: string;
}) {
  const response = await client.post('/api/tasks', data);
  return response.data as FieldTask;
}

export async function updateTask(
  id: string,
  data: Partial<{
    title: string;
    task_type: string;
    description: string;
    farm_id: string | null;
    assignee_user_id: string | null;
    priority: FieldTaskPriority;
    due_date: string | null;
    status: FieldTaskStatus;
  }>,
) {
  const response = await client.put(`/api/tasks/${id}`, data);
  return response.data as FieldTask;
}

export async function deleteTask(id: string) {
  const response = await client.delete(`/api/tasks/${id}`);
  return response.data;
}
