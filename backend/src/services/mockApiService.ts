import express, { Router } from 'express';
import {
  MockHRData,
  MockEmployee,
  MockLeaveRequest,
  MockTicket,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock API Service
 * Provides mock HR API endpoints for testing
 */
class MockApiService {
  private mockData: MockHRData;

  constructor() {
    this.mockData = this.initializeMockData();
  }

  /**
   * Initialize mock HR data
   */
  private initializeMockData(): MockHRData {
    return {
      employees: {
        E101: {
          id: 'E101',
          name: 'John Doe',
          email: 'john.doe@company.com',
          department: 'Engineering',
          leaveBalance: {
            annual: 15,
            sick: 10,
            personal: 5,
          },
          payroll: {
            salary: 75000,
            lastPayment: '2026-04-30',
            nextPayment: '2026-05-31',
          },
        },
        E102: {
          id: 'E102',
          name: 'Jane Smith',
          email: 'jane.smith@company.com',
          department: 'HR',
          leaveBalance: {
            annual: 8,
            sick: 12,
            personal: 3,
          },
          payroll: {
            salary: 68000,
            lastPayment: '2026-04-30',
            nextPayment: '2026-05-31',
          },
        },
        E103: {
          id: 'E103',
          name: 'Bob Johnson',
          email: 'bob.johnson@company.com',
          department: 'Sales',
          leaveBalance: {
            annual: 20,
            sick: 8,
            personal: 4,
          },
          payroll: {
            salary: 82000,
            lastPayment: '2026-04-30',
            nextPayment: '2026-05-31',
          },
        },
      },
      leaveRequests: [],
      tickets: [],
    };
  }

  /**
   * Create Express router with mock API endpoints
   */
  createRouter(): Router {
    const router = express.Router();

    // GET /employees/:id/leave-balance
    router.get('/employees/:id/leave-balance', (req, res) => {
      const { id } = req.params;
      const employee = this.mockData.employees[id];

      if (!employee) {
        return res.status(404).json({
          error: 'Employee not found',
          employeeId: id,
        });
      }

      res.json({
        employeeId: id,
        employeeName: employee.name,
        leaveBalance: employee.leaveBalance,
        timestamp: new Date().toISOString(),
      });
    });

    // POST /employees/:id/leave-request
    router.post('/employees/:id/leave-request', (req, res) => {
      const { id } = req.params;
      const { leaveType, startDate, endDate, reason } = req.body;

      const employee = this.mockData.employees[id];

      if (!employee) {
        return res.status(404).json({
          error: 'Employee not found',
          employeeId: id,
        });
      }

      // Validate leave type
      if (!['annual', 'sick', 'personal'].includes(leaveType)) {
        return res.status(400).json({
          error: 'Invalid leave type',
          validTypes: ['annual', 'sick', 'personal'],
        });
      }

      // Calculate days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Check if employee has enough leave balance
      if (employee.leaveBalance[leaveType as keyof typeof employee.leaveBalance] < days) {
        return res.status(400).json({
          error: 'Insufficient leave balance',
          requested: days,
          available: employee.leaveBalance[leaveType as keyof typeof employee.leaveBalance],
        });
      }

      // Create leave request
      const leaveRequest: MockLeaveRequest = {
        id: uuidv4(),
        employeeId: id,
        leaveType: leaveType as 'annual' | 'sick' | 'personal',
        startDate,
        endDate,
        days,
        reason: reason || 'No reason provided',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      this.mockData.leaveRequests.push(leaveRequest);

      res.status(201).json({
        message: 'Leave request submitted successfully',
        leaveRequest,
      });
    });

    // GET /employees/:id/payroll
    router.get('/employees/:id/payroll', (req, res) => {
      const { id } = req.params;
      const employee = this.mockData.employees[id];

      if (!employee) {
        return res.status(404).json({
          error: 'Employee not found',
          employeeId: id,
        });
      }

      res.json({
        employeeId: id,
        employeeName: employee.name,
        payroll: employee.payroll,
        timestamp: new Date().toISOString(),
      });
    });

    // POST /hr/tickets
    router.post('/hr/tickets', (req, res) => {
      const { employeeId, category, subject, description } = req.body;

      // Validate employee
      if (!this.mockData.employees[employeeId]) {
        return res.status(404).json({
          error: 'Employee not found',
          employeeId,
        });
      }

      // Create ticket
      const ticket: MockTicket = {
        id: uuidv4(),
        employeeId,
        category: category || 'General',
        subject,
        description,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockData.tickets.push(ticket);

      res.status(201).json({
        message: 'Ticket created successfully',
        ticket,
      });
    });

    // GET /hr/tickets/:id
    router.get('/hr/tickets/:id', (req, res) => {
      const { id } = req.params;
      const ticket = this.mockData.tickets.find((t) => t.id === id);

      if (!ticket) {
        return res.status(404).json({
          error: 'Ticket not found',
          ticketId: id,
        });
      }

      res.json(ticket);
    });

    // GET /hr/tickets (list all tickets)
    router.get('/hr/tickets', (req, res) => {
      const { employeeId, status } = req.query;

      let tickets = this.mockData.tickets;

      if (employeeId) {
        tickets = tickets.filter((t) => t.employeeId === employeeId);
      }

      if (status) {
        tickets = tickets.filter((t) => t.status === status);
      }

      res.json({
        tickets,
        total: tickets.length,
      });
    });

    // GET /employees (list all employees)
    router.get('/employees', (req, res) => {
      const employees = Object.values(this.mockData.employees).map((emp) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
      }));

      res.json({
        employees,
        total: employees.length,
      });
    });

    // GET /employees/:id (get employee details)
    router.get('/employees/:id', (req, res) => {
      const { id } = req.params;
      const employee = this.mockData.employees[id];

      if (!employee) {
        return res.status(404).json({
          error: 'Employee not found',
          employeeId: id,
        });
      }

      // Return employee without sensitive payroll data
      res.json({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        leaveBalance: employee.leaveBalance,
      });
    });

    return router;
  }

  /**
   * Get mock data (for testing)
   */
  getMockData(): MockHRData {
    return this.mockData;
  }

  /**
   * Reset mock data
   */
  resetMockData(): void {
    this.mockData = this.initializeMockData();
  }

  /**
   * Add custom employee
   */
  addEmployee(employee: MockEmployee): void {
    this.mockData.employees[employee.id] = employee;
  }

  /**
   * Get employee by ID
   */
  getEmployee(id: string): MockEmployee | undefined {
    return this.mockData.employees[id];
  }

  /**
   * Get all leave requests
   */
  getLeaveRequests(employeeId?: string): MockLeaveRequest[] {
    if (employeeId) {
      return this.mockData.leaveRequests.filter((lr) => lr.employeeId === employeeId);
    }
    return this.mockData.leaveRequests;
  }

  /**
   * Approve leave request
   */
  approveLeaveRequest(requestId: string): MockLeaveRequest | null {
    const request = this.mockData.leaveRequests.find((lr) => lr.id === requestId);
    if (request) {
      request.status = 'approved';
      // Deduct from employee's leave balance
      const employee = this.mockData.employees[request.employeeId];
      if (employee) {
        employee.leaveBalance[request.leaveType] -= request.days;
      }
    }
    return request || null;
  }

  /**
   * Reject leave request
   */
  rejectLeaveRequest(requestId: string): MockLeaveRequest | null {
    const request = this.mockData.leaveRequests.find((lr) => lr.id === requestId);
    if (request) {
      request.status = 'rejected';
    }
    return request || null;
  }
}

// Export singleton instance
export const mockApiService = new MockApiService();

// Made with Bob
