import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Inquiry } from "../../lib/schema";
import { ArrowLeft, Mail, Phone, Calendar, User, MessageSquare, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import Header from "../../components/layout/header";

export default function AdminQueries() {
  const [, navigate] = useLocation();

  // Check authentication
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.accessLevel !== 'Admin') {
      navigate('/');
      return;
    }
  }, [navigate]);

  const { data: inquiries = [], isLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
  });

  const getProjectTypeColor = (type: string | null) => {
    switch (type) {
      case 'residential':
        return 'bg-green-100 text-green-800';
      case 'commercial':
        return 'bg-blue-100 text-blue-800';
      case 'industrial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Inquiries</h1>
              <p className="text-gray-600">View and manage customer inquiries</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
              <Button onClick={() => navigate('/admin/pages')} variant="outline" className="w-full sm:w-auto">
                Back to Admin Pages
              </Button>
              <Button onClick={() => { localStorage.removeItem('user'); navigate('/'); }} variant="outline" className="w-full sm:w-auto">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">{inquiries.length}</div>
                  <div className="text-sm text-gray-600">Total Inquiries</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {inquiries.filter(i => i.projectType === 'residential').length}
                  </div>
                  <div className="text-sm text-gray-600">Residential</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {inquiries.filter(i => i.projectType === 'commercial').length}
                  </div>
                  <div className="text-sm text-gray-600">Commercial</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {inquiries.filter(i => i.projectType === 'industrial').length}
                  </div>
                  <div className="text-sm text-gray-600">Industrial</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {inquiries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No inquiries yet</h3>
                <p className="text-gray-600">Customer inquiries will appear here when submitted through the contact form.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {inquiries.map((inquiry) => (
                <Card key={inquiry.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {inquiry.firstName} {inquiry.lastName}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {inquiry.createdAt ? format(new Date(inquiry.createdAt), "MMM dd, yyyy 'at' hh:mm a") : 'Date not available'}
                            </div>
                            {inquiry.projectType && (
                              <Badge className={getProjectTypeColor(inquiry.projectType)}>
                                {inquiry.projectType.charAt(0).toUpperCase() + inquiry.projectType.slice(1)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`mailto:${inquiry.email}`} 
                          className="text-primary hover:underline"
                        >
                          {inquiry.email}
                        </a>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center space-x-3 text-sm">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <a 
                            href={`tel:${inquiry.phone}`} 
                            className="text-primary hover:underline"
                          >
                            {inquiry.phone}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Project Details:</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`mailto:${inquiry.email}?subject=Re: Your inquiry to E-Tech Enterprises&body=Dear ${inquiry.firstName},\n\nThank you for your inquiry. `)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Reply via Email
                      </Button>
                      {inquiry.phone && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`tel:${inquiry.phone}`)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}