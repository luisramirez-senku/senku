// routes/insights.js
import { PrismaClient } from '@prisma/client';
import verifyToken from '../services/authMiddleware.js';
import { getUserRole } from '../utils/roles.js';

const prisma = new PrismaClient();

export default async function insightsRoutes(fastify) {
fastify.get('/overview', { preHandler: verifyToken }, async (request, reply) => {
const role = getUserRole(request.user);

if (role !== 'merchant') {
return reply.status(403).send({ error: 'Solo los merchants pueden ver insights' });
}

const merchantId = request.user.merchantId;

try {
// Top clientes
const topCustomers = await prisma.customer.findMany({
where: { enrollments: { some: { program: { merchantId } } } },
include: {
    enrollments: {
    where: { program: { merchantId } },
    include: { program: true }
    }
},
orderBy: {
    enrollments: {
    _sum: { points: 'desc' }
    }
},
take: 5
});

// Clientes inactivos (última actividad hace más de 30 días)
const inactiveCustomers = await prisma.customer.findMany({
where: {
    enrollments: {
    some: {
        program: { merchantId },
        updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
    }
},
take: 5
});

// Canjes por mes (últimos 6 meses)
const canjesPorMes = await prisma.$queryRaw`
SELECT DATE_TRUNC('month', "createdAt") AS mes, COUNT(*) AS cantidad
FROM "Voucher"
WHERE "merchantId" = ${merchantId}
GROUP BY mes
ORDER BY mes DESC
LIMIT 6;
`;

// Totales
const totalPuntos = await prisma.enrollment.aggregate({
where: { program: { merchantId } },
_sum: { points: true }
});

const totalCanjes = await prisma.voucher.count({
where: { merchantId }
});

reply.send({
topCustomers,
inactiveCustomers,
canjesPorMes,
totalPuntos: totalPuntos._sum.points || 0,
totalCanjes
});
} catch (err) {
console.error('Error en insights:', err);
reply.status(500).send({ error: 'Error obteniendo insights' });
}
});

fastify.get(
'/insights/customers',
{ preHandler: verifyToken },
async (request, reply) => {
const merchantId = request.user.merchantId;

try {
const topCustomers = await prisma.customer.findMany({
    where: {
    passes: {
        some: {
        program: {
            merchantId
        }
        }
    }
    },
    include: {
    passes: {
        where: {
        program: { merchantId }
        },
        include: {
        program: true
        }
    }
    },
    orderBy: {
    points: 'desc'
    },
    take: 10
});

const inactiveCustomers = await prisma.customer.findMany({
    where: {
    passes: {
        some: {
        program: {
            merchantId
        }
        }
    },
    updatedAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // inactivos 30 días
    }
    }
});

reply.send({
    topCustomers,
    inactiveCustomers
});
} catch (err) {
console.error('Error en insights/customers:', err);
reply.status(500).send({ error: 'Error obteniendo insights de clientes' });
}
}
);

fastify.get(
'/insights/programs',
{ preHandler: verifyToken },
async (request, reply) => {
const merchantId = request.user.merchantId;

try {
const programs = await prisma.loyaltyProgram.findMany({
    where: { merchantId },
    include: {
    _count: {
        select: {
        passes: true,
        rewards: true
        }
    }
    }
});

reply.send({ programs });
} catch (err) {
console.error('Error en insights/programs:', err);
reply.status(500).send({ error: 'Error obteniendo insights de programas' });
}
}
);

fastify.get(
'/insights/sales',
{ preHandler: verifyToken },
async (request, reply) => {
const merchantId = request.user.merchantId;

try {
const redemptions = await prisma.voucher.findMany({
    where: {
    program: {
        merchantId
    },
    status: 'REDEEMED'
    },
    include: {
    reward: true
    }
});

const total = redemptions.reduce((acc, r) => acc + (r.reward?.cost || 0), 0);

reply.send({
    redeemedCount: redemptions.length,
    estimatedValue: total
});
} catch (err) {
console.error('Error en insights/sales:', err);
reply.status(500).send({ error: 'Error obteniendo insights de ventas' });
}
})


// GET /insights/redemptions-per-month
fastify.get('/redemptions-per-month', { preHandler: verifyToken }, async (request, reply) => {
const { merchantId } = request.user;

try {
const data = await prisma.voucher.groupBy({
by: ['createdAt'],
where: {
program: { merchantId }
},
_count: true
});

const monthlyCounts = {};

data.forEach((item) => {
const date = new Date(item.createdAt);
const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Ej: 2025-04
monthlyCounts[key] = (monthlyCounts[key] || 0) + item._count;
});

const result = Object.entries(monthlyCounts)
.map(([month, count]) => ({ month, count }))
.sort((a, b) => a.month.localeCompare(b.month)); // Asegura orden ascendente

reply.send(result);
} catch (error) {
console.error('Error obteniendo redenciones por mes:', error);
reply.status(500).send({ error: 'Error obteniendo redenciones por mes' });
}
});
}

