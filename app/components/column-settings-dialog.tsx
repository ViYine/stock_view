'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
} from '@mui/material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { ColumnConfig } from '@/app/types/stock'

interface ColumnSettingsDialogProps {
  open: boolean
  columns: ColumnConfig[]
  onClose: () => void
  onColumnVisibilityChange: (key: string, visible: boolean) => void
  onColumnReorder: (result: any) => void
  onReset: () => void
}

export function ColumnSettingsDialog({
  open,
  columns,
  onClose,
  onColumnVisibilityChange,
  onColumnReorder,
  onReset,
}: ColumnSettingsDialogProps) {
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>列设置</DialogTitle>
      <DialogContent>
        <DragDropContext onDragEnd={onColumnReorder}>
          <Droppable droppableId="columns">
            {(provided, snapshot) => (
              <List
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{
                  backgroundColor: snapshot.isDraggingOver ? '#f5f5f5' : 'transparent',
                  transition: 'background-color 0.2s',
                }}
              >
                {sortedColumns.map((column, index) => (
                  <Draggable key={column.key} draggableId={column.key} index={index}>
                    {(provided, snapshot) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          backgroundColor: snapshot.isDragging ? '#e3f2fd' : 'transparent',
                          marginBottom: 1,
                          borderRadius: 1,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <ListItemIcon {...provided.dragHandleProps}>
                          <DragIndicatorIcon />
                        </ListItemIcon>
                        <ListItemText primary={column.label} />
                        <Switch
                          edge="end"
                          checked={column.visible}
                          onChange={(e) =>
                            onColumnVisibilityChange(column.key, e.target.checked)
                          }
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onReset} color="secondary">
          重置
        </Button>
        <Button onClick={onClose} variant="contained">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  )
}
