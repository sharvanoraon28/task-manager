
import React, { useState, useMemo, useCallback } from 'react';
import { Task, SubTask, Priority } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import TaskItem from './components/TaskItem';
import Modal from './components/Modal';
import TaskForm from './components/TaskForm';
import { PlusIcon, SparklesIcon } from './components/icons';
import { breakDownTask } from './services/geminiService';

const App: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [breakingDownTaskId, setBreakingDownTaskId] = useState<string | null>(null);

  const handleOpenModal = () => setIsModalOpen(true);
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'completed' | 'subTasks'> & { id?: string }) => {
    if (taskData.id) { // Editing existing task
      setTasks(tasks.map(t => t.id === taskData.id ? { ...t, ...taskData, dueDate: new Date(taskData.dueDate).toISOString() } : t));
    } else { // Adding new task
      const newTask: Task = {
        id: crypto.randomUUID(),
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        completed: false,
        subTasks: [],
      };
      setTasks([...tasks, newTask]);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    handleOpenModal();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };
    
  const handleToggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                subTasks: task.subTasks.map(sub => 
                    sub.id === subTaskId ? { ...sub, completed: !sub.completed } : sub
                )
            };
        }
        return task;
    }));
  };

  const handleBreakDownTask = useCallback(async (task: Task) => {
    setBreakingDownTaskId(task.id);
    try {
      const subTaskTitles = await breakDownTask(task.title, task.description);
      const newSubTasks: SubTask[] = subTaskTitles.map(title => ({
        id: crypto.randomUUID(),
        title,
        completed: false,
      }));
      
      setTasks(prevTasks => prevTasks.map(t => 
        t.id === task.id ? { ...t, subTasks: [...t.subTasks, ...newSubTasks] } : t
      ));

    } catch (error) {
      console.error("Failed to break down task:", error);
      // Optionally, show an error to the user
    } finally {
      setBreakingDownTaskId(null);
    }
  }, [setTasks]);

  const { upcomingTasks, completedTasks } = useMemo(() => {
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return {
      upcomingTasks: sortedTasks.filter(t => !t.completed),
      completedTasks: sortedTasks.filter(t => t.completed),
    };
  }, [tasks]);

  const renderTaskList = (taskList: Task[], title: string) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">{title} ({taskList.length})</h2>
      {taskList.length > 0 ? (
        <div className="space-y-4">
          {taskList.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              onBreakDown={handleBreakDownTask}
              onToggleSubTask={handleToggleSubTask}
              isBreakingDown={breakingDownTaskId === task.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">
            {title === "Upcoming" ? "No upcoming tasks. Add one to get started!" : "No completed tasks yet."}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Student Task Hub</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Organize your academic life with a little help from AI.</p>
            </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Task
          </button>
        </header>
        
        {renderTaskList(upcomingTasks, "Upcoming")}
        {renderTaskList(completedTasks, "Completed")}

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={taskToEdit ? 'Edit Task' : 'Add New Task'}>
          <TaskForm onSave={handleSaveTask} onClose={handleCloseModal} taskToEdit={taskToEdit} />
        </Modal>
      </main>
    </div>
  );
};

export default App;
