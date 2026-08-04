-- CreateEnum
CREATE TYPE "Domain" AS ENUM ('Sourcing', 'Logistics', 'CustomerService', 'Marketing', 'Finance', 'General');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NotStarted', 'InProgress', 'Blocked', 'Done');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Low', 'Medium', 'High', 'Urgent');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "domain" "Domain" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'NotStarted',
    "priority" "Priority" NOT NULL DEFAULT 'Medium',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
