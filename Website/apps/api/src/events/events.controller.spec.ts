/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';

const mockResult = { id: 'evt-1', title: 'Test' };
const mockPaginated = { data: [mockResult], meta: { page: 1, limit: 12, total: 1, totalPages: 1 } };

const mockService = {
  findAll: jest.fn<any>().mockResolvedValue(mockPaginated),
  findPopular: jest.fn<any>().mockResolvedValue([mockResult]),
  findNearby: jest.fn<any>().mockResolvedValue([mockResult]),
  findOne: jest.fn<any>().mockResolvedValue(mockResult),
  create: jest.fn<any>().mockResolvedValue(mockResult),
  update: jest.fn<any>().mockResolvedValue(mockResult),
  remove: jest.fn<any>().mockResolvedValue({ message: 'Event deleted' }),
  findByOrganizer: jest.fn<any>().mockResolvedValue([mockResult]),
};

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service', async () => {
    const result = await controller.findAll({});
    expect(result).toEqual(mockPaginated);
    expect(mockService.findAll).toHaveBeenCalledWith({});
  });

  it('findPopular delegates to service', async () => {
    const result = await controller.findPopular();
    expect(result).toEqual([mockResult]);
  });

  it('findNearby parses lat/lng', async () => {
    await controller.findNearby('-6.2', '106.8', '10');
    expect(mockService.findNearby).toHaveBeenCalledWith(-6.2, 106.8, 10);
  });

  it('findOne delegates to service', async () => {
    const result = await controller.findOne('evt-1');
    expect(result).toEqual(mockResult);
  });

  it('create passes user sub + dto', async () => {
    const req = { user: { sub: 'user-1' } };
    const dto = { title: 'New' } as any;
    await controller.create(req, dto);
    expect(mockService.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('update passes id, user sub, dto', async () => {
    const req = { user: { sub: 'user-1' } };
    const dto = { title: 'Updated' } as any;
    await controller.update('evt-1', req, dto);
    expect(mockService.update).toHaveBeenCalledWith('evt-1', 'user-1', dto);
  });

  it('remove passes id + user sub', async () => {
    const req = { user: { sub: 'user-1' } };
    await controller.remove('evt-1', req);
    expect(mockService.remove).toHaveBeenCalledWith('evt-1', 'user-1');
  });

  it('findByOrganizer delegates to service', async () => {
    const result = await controller.findByOrganizer('user-1');
    expect(result).toEqual([mockResult]);
  });
});