import express from 'express';
import { body } from "express-validator";
import { validateRequest, BadRequestError, currentUser, requireAuth } from '@yazidy-tickets/common';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';

const router = express.Router()


router.route('/signin')
    .post(body('email').isEmail(), body('password').trim().isLength({ min: 5, max: 20 }),
        validateRequest,
        async (req, res, next) => {
            const { email, password } = req.body;

            const userExist = await User.findOne({ email });

            if (userExist) {
                throw new BadRequestError('email already exists')
            }

            const u = User.build({ email, password });
            await u.save();

            const token = jwt.sign({ id: u.id, email: u.email }, process.env.JWT_SECRET!);
            req.session = {
                jwt: token
            };

            res.status(201).send(u);
        })

router.route('/currentuser').get(currentUser, requireAuth, (req, res, next) => {
    res.status(200).send({ currentUser: req.currentUser });

})


router.route('/signout').post((req, res, next) => {
    // terminate jwt when user signed out
    req.session = null;
    res.status(200).send({});
})

router.route('/login')
    .post(body('email').isEmail(), body('password').trim().isLength({ min: 5, max: 20 }),
        validateRequest,
        async (req, res, next) => {
            // 1) check if user already exist
            const { email, password } = req.body;
            const existingUser = await User.findOne({ email });

            if (!existingUser) throw new BadRequestError('invalid credentials 🥲');

            // 2) check if password is correct
            const validPass = await User.comparePassword(password, existingUser.password);

            if (!validPass) throw new BadRequestError('invalid credentials 🥲');

            // 3) if every thing was ok
            const token = jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.JWT_SECRET!);
            req.session = {
                jwt: token
            };

            res.status(200).send(existingUser);
        })

export { router }