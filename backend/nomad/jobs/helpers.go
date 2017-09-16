package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
)

func updateJob(client *api.Client, job *api.Job) error {
	// if n.Config.NomadReadOnly {
	// 	return &structs.Action{Type: structs.ErrorNotification, Payload: "The backend server is set to read-only"}, errors.New("Nomad is in read-only mode")
	// }

	_, _, err := client.Jobs().Register(job, nil)
	if err != nil {
		return err
	}

	return nil
}

func changeTaskGroupCount(job *api.Job, groupName string, f func(tg *api.TaskGroup)) error {
	var foundTaskGroup *api.TaskGroup
	for _, taskGroup := range job.TaskGroups {
		if *taskGroup.Name == groupName {
			foundTaskGroup = taskGroup
			break
		}
	}

	if *foundTaskGroup.Name == "" {
		return fmt.Errorf("Could not find Task Group: %s", groupName)
	}

	f(foundTaskGroup)
	return nil
}

func getTaskGroupCount(job *api.Job, groupName string) (int, error) {
	for _, taskGroup := range job.TaskGroups {
		if *taskGroup.Name == groupName {
			return *taskGroup.Count, nil
		}
	}

	return 0, fmt.Errorf("Could not find Task Group: %s", groupName)
}

func increaseTaskGroupCount(job *api.Job, groupName string) error {
	incr := func(tg *api.TaskGroup) {
		tg.Count = IntToPtr(PtrToInt(tg.Count) + 1)
	}

	return changeTaskGroupCount(job, groupName, incr)
}

func decreaseTaskGroupCount(job *api.Job, groupName string) error {
	decr := func(tg *api.TaskGroup) {
		tg.Count = IntToPtr(PtrToInt(tg.Count) - 1)
	}

	return changeTaskGroupCount(job, groupName, decr)
}

func setTaskGroupCount(job *api.Job, groupName string, count int) error {
	decr := func(tg *api.TaskGroup) {
		tg.Count = IntToPtr(count)
	}

	return changeTaskGroupCount(job, groupName, decr)
}
