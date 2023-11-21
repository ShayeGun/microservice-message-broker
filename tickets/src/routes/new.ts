import express from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, Exchanges, ExchangeTypes } from "@yazidy-tickets/common";
import { ticketEmitter } from "../events/publisher/ticket-create-publisher";
import { ticketUpdate } from "../events/publisher/ticket-update-publisher";

const router = express.Router();

router.route("")
    .post(
        body('title').not().isEmpty().withMessage('title is required'),
        body('price').isFloat({ gt: 0 }).withMessage('invalid price'),
        validateRequest
        , async (req, res, next) => {
            const { title, price } = req.body;

            const ticket = Ticket.build({
                title,
                price,
                userId: req.currentUser!.id,
            });
            await ticket.save();

            const data = {
                id: ticket._id,
                title: ticket.title,
                price: ticket.price,
                userId: ticket.userId
            };

            await ticketEmitter.fastPublish(data);

            res.status(201).send(ticket);
        })
    .get(async (req, res) => {
        const ticket = await Ticket.find();

        if (!ticket) throw new NotFoundError();

        res.status(200).send(ticket);
    });

router.route('/:id')
    .get(async (req, res) => {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) throw new NotFoundError();

        res.status(200).send(ticket);
    })
    .patch(requireAuth,
        body('title').not().isEmpty().withMessage('title is required'),
        body('price').isFloat({ gt: 0 }).withMessage('invalid price'),
        validateRequest,
        async (req, res, next) => {
            const ticket = await Ticket.findById(req.params.id);

            if (!ticket) throw new NotFoundError();

            if (ticket.userId !== req.currentUser.id) throw new NotAuthorizedError();

            const { title, price } = req.body;
            ticket.set({ title, price });
            await ticket.save();

            const data = {
                id: ticket._id,
                title: ticket.title,
                price: ticket.price,
                userId: ticket.userId
            };

            res.status(201).send(ticket);

            res.send(ticket);
        });

export { router };