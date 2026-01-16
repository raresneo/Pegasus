
import { Member, Task, Booking, Product, Payment } from '../types';

// Esta camada simula chamadas de rede que seriam feitas para um backend real.
// Em produção, aqui seriam chamadas fetch/axios para seu endpoint.

const API_DELAY = 500;

export const ApiService = {
    members: {
        getAll: async (): Promise<Member[]> => {
            await new Promise(resolve => setTimeout(resolve, API_DELAY));
            return JSON.parse(localStorage.getItem('fitable_members') || '[]');
        },
        update: async (member: Member): Promise<void> => {
            const members = await ApiService.members.getAll();
            const index = members.findIndex(m => m.id === member.id);
            if (index > -1) {
                members[index] = member;
                localStorage.setItem('fitable_members', JSON.stringify(members));
            }
        },
        add: async (member: Member): Promise<void> => {
            const members = await ApiService.members.getAll();
            members.push(member);
            localStorage.setItem('fitable_members', JSON.stringify(members));
        }
    },
    tasks: {
        getAll: async (): Promise<Task[]> => {
            await new Promise(resolve => setTimeout(resolve, API_DELAY));
            return JSON.parse(localStorage.getItem('fitable_tasks') || '[]');
        },
        save: async (task: Task): Promise<void> => {
            const tasks = await ApiService.tasks.getAll();
            const index = tasks.findIndex(t => t.id === task.id);
            if (index > -1) tasks[index] = task; else tasks.push(task);
            localStorage.setItem('fitable_tasks', JSON.stringify(tasks));
        }
    }
    // Adicionar outros serviços conforme necessário (POS, Bookings...)
};
