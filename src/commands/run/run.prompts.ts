import type { AnyRecord } from '@neodx/std'
import { entries, keys } from '@neodx/std'
import inquirer from 'inquirer'
import { ROOT_PROJECT } from '@/pkg-manager/pkg-manager.consts'
import type { WorkspaceProject } from '@/pkg-manager/pkg-manager.types'
import { invariant, truncateString } from '@/shared/misc'

export async function buildTargetInfoPrompt(
  projects: WorkspaceProject[]
): Promise<[string, string]> {
  const hasWorkspaces = projects.length > 1

  if (!hasWorkspaces) {
    const rootProject = projects.find(({ name }) => name === ROOT_PROJECT)

    invariant(
      rootProject,
      `No root package.json found. Please ensure that project is set up correctly.`
    )

    const choices = keys(rootProject.targets)
    const target = await selectRootTargetPrompt(choices)

    return [target, ROOT_PROJECT]
  }

  const { target, project } = await buildTargetPromptTree(projects)

  return [target, project]
}

async function selectRootTargetPrompt(choices: string[]): Promise<string> {
  const { default: searchListPrompt } = await import('inquirer-search-list')

  inquirer.registerPrompt('search-list', searchListPrompt)

  const { targetName } = await inquirer.prompt([
    {
      type: 'search-list',
      message: 'Select target:',
      name: 'targetName',
      choices
    }
  ])

  return targetName
}

async function buildTargetPromptTree(projects: WorkspaceProject[]): Promise<{
  target: string
  project: string
}> {
  const { default: treePrompt } = await import('inquirer-tree-prompt')
  inquirer.registerPrompt('tree', treePrompt)

  const { targetInfo } = await inquirer.prompt([
    {
      type: 'tree',
      name: 'targetInfo',
      multiple: false,
      validate: Boolean,
      message: 'Select the project target:',
      tree: projects.flatMap<AnyRecord>((project) => {
        const children = entries(project.targets).map(
          ([targetName, script]) => ({
            name: targetName,
            value: {
              project: project.name,
              target: targetName
            },
            short: truncateString(script, 14)
          })
        )

        if (project.name === ROOT_PROJECT) return children

        return {
          name: project.name,
          value: '',
          open: true,
          children
        }
      })
    }
  ])

  return targetInfo
}
