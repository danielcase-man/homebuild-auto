import * as React from "react"
import { cn, a11y } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, File, X, CheckCircle, AlertCircle, Image, FileText } from "lucide-react"

export interface FileUploadProps {
  /**
   * Accept specific file types
   */
  accept?: string
  /**
   * Allow multiple file selection
   */
  multiple?: boolean
  /**
   * Maximum file size in bytes
   */
  maxSize?: number
  /**
   * Maximum number of files
   */
  maxFiles?: number
  /**
   * Construction document type for validation
   */
  documentType?: "plans" | "permits" | "photos" | "contracts" | "inspections" | "certificates"
  /**
   * Upload handler
   */
  onUpload?: (files: File[]) => Promise<void>
  /**
   * Progress callback
   */
  onProgress?: (progress: number) => void
  /**
   * Upload completion callback
   */
  onComplete?: (uploadedFiles: UploadedFile[]) => void
  /**
   * Error callback
   */
  onError?: (error: string) => void
  /**
   * Field optimized for outdoor use
   */
  fieldOptimized?: boolean
  /**
   * Mobile optimized
   */
  mobile?: boolean
  /**
   * Drag and drop enabled
   */
  dragDrop?: boolean
  /**
   * Show file preview
   */
  showPreview?: boolean
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  status: "uploading" | "completed" | "error"
  progress?: number
  error?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  documentType,
  onUpload,
  onProgress,
  onComplete,
  onError,
  fieldOptimized = false,
  mobile = false,
  dragDrop = true,
  showPreview = true
}) => {
  const [files, setFiles] = React.useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dropZoneRef = React.useRef<HTMLDivElement>(null)
  const uploadId = a11y.generateId('file-upload')

  // File type configurations for construction documents
  const documentConfigs = {
    plans: {
      accept: ".pdf,.dwg,.jpg,.jpeg,.png",
      label: "Building Plans",
      description: "Upload architectural plans, blueprints, or drawings"
    },
    permits: {
      accept: ".pdf,.jpg,.jpeg,.png",
      label: "Permits & Approvals", 
      description: "Upload permit documents and approval letters"
    },
    photos: {
      accept: ".jpg,.jpeg,.png,.webp",
      label: "Construction Photos",
      description: "Upload progress photos and documentation images"
    },
    contracts: {
      accept: ".pdf,.doc,.docx",
      label: "Contracts & Agreements",
      description: "Upload contracts, agreements, and legal documents"
    },
    inspections: {
      accept: ".pdf,.jpg,.jpeg,.png",
      label: "Inspection Reports",
      description: "Upload inspection reports and certificates"
    },
    certificates: {
      accept: ".pdf,.jpg,.jpeg,.png",
      label: "Certificates & Compliance",
      description: "Upload certificates and compliance documentation"
    }
  }

  const config = documentType ? documentConfigs[documentType] : null
  const finalAccept = accept || config?.accept || "*/*"

  // File validation
  const validateFile = React.useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    }

    if (finalAccept !== "*/*") {
      const allowedTypes = finalAccept.split(",").map(type => type.trim())
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
      const mimeType = file.type.toLowerCase()
      
      const isAllowed = allowedTypes.some(type => 
        type === fileExtension || 
        mimeType.startsWith(type.replace("*", ""))
      )
      
      if (!isAllowed) {
        return `File type not allowed. Accepted types: ${finalAccept}`
      }
    }

    return null
  }, [maxSize, finalAccept])

  // Handle file selection
  const handleFiles = React.useCallback(async (selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = []
    const errors: string[] = []

    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`)
      onError?.(errors.join(", "))
      return
    }

    // Process each file
    Array.from(selectedFiles).forEach((file, index) => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
        return
      }

      newFiles.push({
        id: a11y.generateId('file'),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0
      })
    })

    if (errors.length > 0) {
      onError?.(errors.join(", "))
      return
    }

    setFiles(prev => [...prev, ...newFiles])
    
    // Simulate upload process
    if (onUpload) {
      setIsUploading(true)
      try {
        await onUpload(Array.from(selectedFiles))
        
        // Update file statuses to completed
        setFiles(prev => prev.map(file => 
          newFiles.find(nf => nf.id === file.id) 
            ? { ...file, status: "completed" as const, progress: 100 }
            : file
        ))
        
        onComplete?.(newFiles.map(f => ({ ...f, status: "completed" as const })))
        a11y.announce(`${newFiles.length} file(s) uploaded successfully`, 'polite')
      } catch (error) {
        setFiles(prev => prev.map(file => 
          newFiles.find(nf => nf.id === file.id) 
            ? { ...file, status: "error" as const, error: String(error) }
            : file
        ))
        onError?.(String(error))
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
  }, [files, maxFiles, validateFile, onUpload, onComplete, onError])

  // Drag and drop handlers
  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  // File input change handler
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  // Remove file
  const removeFile = React.useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    a11y.announce("File removed", 'polite')
  }, [])

  // Get file icon
  const getFileIcon = React.useCallback((file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }, [])

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        ref={dropZoneRef}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          isDragging 
            ? "border-construction-blue bg-blue-50" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          fieldOptimized && "min-h-[120px] border-4",
          mobile && "min-h-[100px]",
          !dragDrop && "border-solid"
        )}
        onDragOver={dragDrop ? handleDragOver : undefined}
        onDragLeave={dragDrop ? handleDragLeave : undefined}
        onDrop={dragDrop ? handleDrop : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={finalAccept}
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
          id={uploadId}
          aria-describedby={config ? `${uploadId}-description` : undefined}
        />
        
        <div className={cn(
          "flex flex-col items-center justify-center p-6 text-center",
          fieldOptimized && "p-8",
          mobile && "p-4"
        )}>
          <Upload className={cn(
            "text-muted-foreground mb-2",
            fieldOptimized ? "h-8 w-8" : "h-6 w-6"
          )} />
          
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold",
              fieldOptimized ? "text-lg" : "text-sm",
              mobile && "text-base"
            )}>
              {config?.label || "Upload Files"}
            </h3>
            
            {config?.description && (
              <p 
                id={`${uploadId}-description`}
                className={cn(
                  "text-muted-foreground text-xs",
                  fieldOptimized && "text-sm",
                  mobile && "text-sm"
                )}
              >
                {config.description}
              </p>
            )}
            
            <div className={cn(
              "text-xs text-muted-foreground",
              fieldOptimized && "text-sm"
            )}>
              {dragDrop && "Drag and drop files here or "}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs font-normal"
                onClick={() => fileInputRef.current?.click()}
              >
                browse files
              </Button>
            </div>
            
            <div className={cn(
              "text-xs text-muted-foreground",
              fieldOptimized && "text-sm"
            )}>
              Max {maxFiles} files, {Math.round(maxSize / 1024 / 1024)}MB each
              {finalAccept !== "*/*" && ` • ${finalAccept}`}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Progress 
          value={uploadProgress}
          label="Uploading files"
          showValue
          mobile={mobile}
          constructionType="project"
        />
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className={cn(
            "font-medium text-sm",
            fieldOptimized && "text-base"
          )}>
            Uploaded Files ({files.length})
          </h4>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg",
                  fieldOptimized && "p-4",
                  file.status === "error" && "border-red-200 bg-red-50",
                  file.status === "completed" && "border-green-200 bg-green-50"
                )}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {getFileIcon(file)}
                  
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "font-medium truncate",
                      fieldOptimized ? "text-base" : "text-sm"
                    )}>
                      {file.name}
                    </p>
                    <p className={cn(
                      "text-muted-foreground",
                      fieldOptimized ? "text-sm" : "text-xs"
                    )}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      status={file.status === "uploading" ? "IN_PROGRESS" : 
                             file.status === "completed" ? "COMPLETED" : "DELAYED"}
                      size={mobile ? "mobile" : "sm"}
                    />
                    
                    {file.status === "completed" && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    
                    {file.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  ariaLabel={`Remove ${file.name}`}
                  className="ml-2 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { FileUpload }