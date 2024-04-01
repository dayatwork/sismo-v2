// import prisma from "~/lib/prisma";

// export async function getDirectorates() {
//   const directorates = await prisma.directorate.findMany({
//     include: { divisions: true },
//   });
//   return directorates;
// }

// export async function createDirectorate({ name }: { name: string }) {
//   const directorate = await prisma.directorate.create({
//     data: { name },
//   });
//   return directorate;
// }

// export async function getDirectorateById({ id }: { id: string }) {
//   const directorate = await prisma.directorate.findUnique({
//     where: { id },
//   });
//   return directorate;
// }

// export async function editDirectorate({
//   id,
//   name,
// }: {
//   id: string;
//   name: string;
// }) {
//   const directorate = await prisma.directorate.update({
//     where: { id },
//     data: { name },
//   });
//   return directorate;
// }

// export async function deleteDirectorate({ id }: { id: string }) {
//   const directorate = await prisma.directorate.delete({
//     where: { id },
//   });
//   return directorate;
// }
