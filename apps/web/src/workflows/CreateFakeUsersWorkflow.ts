import { fakerFR as faker } from "@faker-js/faker";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { getSeedTenant } from "@/lib/seedContext";
import { $Enums } from "@/prisma/client";

import { type IWorkflow } from "./IWorkflow";

const MIN_USERS = config.seed.minFakeUsers || 8; // Default to 8 if not set in config
const MAX_USERS = config.seed.maxFakeUsers || 16; // Default to 16 if not set in config
const USERS_COUNT = faker.number.int({ min: MIN_USERS, max: MAX_USERS });

export class CreateFakeUsersWorkflow implements IWorkflow {
  public async run() {
    const tenant = getSeedTenant();

    const userStatusKeys = Object.keys($Enums.UserStatus) as Array<keyof typeof $Enums.UserStatus>;
    for (let i = 0; i < USERS_COUNT; i++) {
      const fakeUserSexType = faker.person.sexType();
      const fakeUserFirstName = faker.person.firstName(fakeUserSexType);
      const fakeUserLastName = faker.person.lastName(fakeUserSexType);
      const fakeCreatedAt = faker.date.past();

      const userIteration = await prisma.user.create({
        data: {
          createdAt: fakeCreatedAt,
          username: faker.internet.username({
            firstName: fakeUserFirstName,
            lastName: fakeUserLastName,
          }),
          name: faker.person.fullName({
            sex: fakeUserSexType,
            firstName: fakeUserFirstName,
            lastName: fakeUserLastName,
          }),
          email: faker.internet
            .email({
              provider: "faker.beta.gouv.fr",
              firstName: fakeUserFirstName,
              lastName: fakeUserLastName,
            })
            .toLocaleLowerCase(),
          emailVerified: faker.date.soon({ refDate: fakeCreatedAt }),
          role: $Enums.UserRole.USER,
          status: $Enums.UserStatus[userStatusKeys[faker.number.int(userStatusKeys.length - 1)]],
        },
      });

      await prisma.userOnTenant.create({
        data: {
          userId: userIteration.id,
          tenantId: tenant.id,
          role: $Enums.UserRole.USER,
          status: $Enums.UserStatus[userStatusKeys[faker.number.int(userStatusKeys.length - 1)]],
          joinedAt: fakeCreatedAt,
        },
      });
    }

    const userOnTenantCount = await prisma.userOnTenant.count();
    if (userOnTenantCount !== USERS_COUNT + 1) {
      throw new Error(`Expected ${USERS_COUNT + 1} users on tenant, found ${userOnTenantCount} (counting admin)`);
    }
  }
}
