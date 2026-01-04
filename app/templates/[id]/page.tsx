import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toggleTemplateActive } from '@/app/actions/templates'
import type { TemplateContent } from '@/types/template'

export default async function TemplateDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: template } = await supabase
    .from('templates')
    .select('*')
    .eq('id', params.id)
    .eq('doctor_id', user.id)
    .single()

  if (!template) {
    notFound()
  }

  const content = template.schema_json as TemplateContent
  const deactivateAction = toggleTemplateActive.bind(null, template.id, false)
  const activateAction = toggleTemplateActive.bind(null, template.id, true)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard">
            <h1 className="text-xl font-bold hover:text-primary transition-colors">
              Arog Doctor Platform
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/templates" className="text-sm hover:text-primary">
              Templates
            </Link>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action="/api/auth/logout" method="post">
              <button className="text-sm text-primary hover:underline">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 p-6">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{template.name}</h2>
              <p className="text-muted-foreground">
                {template.description || 'No description'}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/templates/${template.id}/edit`}>
                <Button variant="outline">Edit</Button>
              </Link>
              {template.is_active ? (
                <form action={deactivateAction}>
                  <Button type="submit" variant="destructive">
                    Deactivate
                  </Button>
                </form>
              ) : (
                <form action={activateAction}>
                  <Button type="submit" variant="default">
                    Activate
                  </Button>
                </form>
              )}
            </div>
          </div>

          {!template.is_active && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                This template is currently inactive and cannot be used for document generation.
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Category</span>
                  <span className="text-sm capitalize">
                    {template.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Status</span>
                  <span className={`text-sm ${template.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Variables</span>
                  <span className="text-sm">{content.variables?.length || 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm">
                    {new Date(template.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variables Used</CardTitle>
              </CardHeader>
              <CardContent>
                {content.variables && content.variables.length > 0 ? (
                  <div className="space-y-1">
                    {content.variables.map((variable, index) => (
                      <div key={index} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {`{{${variable}}}`}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No variables defined
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Content</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md font-mono overflow-x-auto">
                {content.content}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link href={`/documents/new?templateId=${template.id}`}>
                  <Button variant="outline" className="w-full" disabled={!template.is_active}>
                    Use This Template
                  </Button>
                </Link>
                <Link href={`/templates/${template.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    Edit Template
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
