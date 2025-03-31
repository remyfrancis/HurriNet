import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TeamManagement from "@/components/Teams/team-management"
import TeamAssignment from "@/components/Teams/team-assignment"
import PeopleManagement from "@/components/Teams/people-management"
import { AdminNav } from "../admin-nav"

export default function TeamsPage() {
  return (
    <div className="flex min-h-screen">
      <AdminNav className="w-64 border-r bg-background hidden md:block" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Team Management</h1>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Create, edit, and manage response teams</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="people">
            <Card>
              <CardHeader>
                <CardTitle>People Management</CardTitle>
                <CardDescription>Manage personnel and assign them to teams</CardDescription>
              </CardHeader>
              <CardContent>
                <PeopleManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Team Assignments</CardTitle>
                <CardDescription>Assign teams to incidents, medical facilities, and shelters</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamAssignment />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

