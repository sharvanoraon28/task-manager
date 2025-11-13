
import React from 'react';
import { Task, SubTask, Priority } from '../types';
import { TrashIcon, PencilIcon, SparklesIcon, CheckIcon, ChevronDownIcon } from './icons';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onBreakDown: (task: Task) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  isBreakingDown: boolean;
}

const priorityStyles: { [key in Priority]: string } = {
  [Priority.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [Priority.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [Priority.Low]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onEdit, onBreakDown, onToggleSubTask, isBreakingDown }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    
    const hasDetails = task.description || task.subTasks.length > 0;

    return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md transition-all duration-300 ${task.completed ? 'opacity-60' : ''}`}>
      <div className="p-4 flex items-start gap-4">
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 transition-all duration-200 ${task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && <CheckIcon className="w-4 h-4 text-white mx-auto my-auto" />}
        </button>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <p className={`font-semibold text-lg ${task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{task.subject}</span>
                <span>&bull;</span>
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
             {hasDetails && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            )}
          </div>
          
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 ml-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityStyles[task.priority]}`}>
                {task.priority}
            </span>
            <div className="flex items-center gap-1 mt-2 sm:mt-0">
                <button onClick={() => onBreakDown(task)} disabled={isBreakingDown} className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Break down task with AI">
                    {isBreakingDown ? (
                        <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <SparklesIcon className="w-5 h-5" />
                    )}
                </button>
                <button onClick={() => onEdit(task)} className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="Edit task">
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(task.id)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label="Delete task">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
      {isExpanded && hasDetails && (
        <div className="pl-14 pr-4 pb-4">
            {task.description && <p className="text-slate-600 dark:text-slate-300 mb-3 text-sm">{task.description}</p>}
            {task.subTasks.length > 0 && (
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sub-tasks:</h4>
                    {task.subTasks.map(sub => (
                        <div key={sub.id} className="flex items-center gap-3">
                            <button
                                onClick={() => onToggleSubTask(task.id, sub.id)}
                                className={`w-5 h-5 rounded border-2 flex-shrink-0 transition-all duration-200 ${sub.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-500 hover:border-indigo-500'}`}
                                aria-label={sub.completed ? 'Mark sub-task as incomplete' : 'Mark sub-task as complete'}
                            >
                                {sub.completed && <CheckIcon className="w-3 h-3 text-white mx-auto my-auto" />}
                            </button>
                            <span className={`text-sm ${sub.completed ? 'line-through text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>{sub.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
