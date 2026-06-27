import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import * as dailyController from './daily.controller';
import { createDailyLogSchema, updateDailyLogSchema, createTimelineEventSchema, updateTimelineEventSchema, createMealSchema } from './daily.schema';

const router = Router();

router.use(authenticate);

router.get('/', dailyController.searchEntries);
router.get('/today', dailyController.getToday);
router.get('/:date', dailyController.getDay);
router.put('/:date', validateBody(updateDailyLogSchema), dailyController.updateDay);

router.post('/events', validateBody(createTimelineEventSchema), dailyController.createEvent);
router.put('/events/:eventId', validateBody(updateTimelineEventSchema), dailyController.updateEvent);
router.delete('/events/:eventId', dailyController.deleteEvent);

router.post('/meals', validateBody(createMealSchema), dailyController.createMeal);
router.delete('/meals/:mealId', dailyController.deleteMeal);

export default router;
