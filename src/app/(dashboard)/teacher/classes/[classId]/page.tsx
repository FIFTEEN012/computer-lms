import { redirect } from 'next/navigation'

export default function ClassRootPage({ params }: { params: { classId: string } }) {
  // Immediately abstract the root directory into the primary workspace tab
  redirect(`/teacher/classes/${params.classId}/students`)
}
