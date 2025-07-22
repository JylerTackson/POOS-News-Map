import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { retrieveTeamInfo } from '../../src/api/team/controller.js';

describe('Unit Test - retrieveTeamInfo', () => {
  it('should return 200 and list of team articles', async () => {
    const mockArticles = [{ name: 'Alice' }, { name: 'Bob' }];
    const mockFind = jest.fn().mockResolvedValue(mockArticles);
    jest.spyOn(mongoose, 'model').mockReturnValue({ find: mockFind });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await retrieveTeamInfo(req, res);

    expect(mongoose.model).toHaveBeenCalledWith('TeamInfo', expect.anything(), 'TeamInfo');
    expect(mockFind).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockArticles);
  });

  it('should return 500 if DB throws error', async () => {
    const mockFind = jest.fn().mockRejectedValue(new Error('DB Error'));
    jest.spyOn(mongoose, 'model').mockReturnValue({ find: mockFind });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await retrieveTeamInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB Error' });
  });
});
